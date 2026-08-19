import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from 'src/modules/authentication/usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import {
  Provider,
  RolUsuario,
  Usuario,
} from 'src/modules/authentication/usuarios/entities/usuario.entity';
import { DocentesService } from 'src/modules/principales/docentes/docentes.service';
import { DataSource } from 'typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { MailerService } from 'src/shared/mailer/mailer.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordRecoveryResponse } from './interfaces/password-recovery-response.interface';

const PASSWORD_RECOVERY_MESSAGE =
  'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.';
const INVALID_PASSWORD_RESET_TOKEN_MESSAGE =
  'El enlace de recuperación no es válido o ha expirado';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private docentesService: DocentesService,
    private dataSource: DataSource,
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {}

  async register(
    email: string,
    password: string,
    rol?: RolUsuario,
    numeroDocumento?: string,
  ): Promise<string> {
    return await this.dataSource.transaction(async (manager) => {
      const existe = await this.usuariosService.findByEmail(email, manager);
      if (existe) {
        throw new ConflictException('El usuario ya existe');
      }

      if (rol === RolUsuario.DOCENTE) {
        if (!numeroDocumento) {
          throw new BadRequestException(
            'numeroDocumento es obligatorio para el rol DOCENTE',
          );
        }

        const docente = await this.docentesService.findByIdentificacion(
          numeroDocumento,
          manager,
        );

        if (!docente) {
          throw new NotFoundException(
            'No se encontro un docente con el numero de documento proporcionado',
          );
        }

        if (docente.usuario_id) {
          throw new ConflictException(
            'El docente ya tiene un usuario vinculado',
          );
        }

        const user = await this.usuariosService.createLocal(
          email,
          password,
          rol,
          manager,
        );
        await this.docentesService.assignUsuario(docente.id, user.id, manager);
        return this.generateAccessToken(user);
      }

      const user = await this.usuariosService.createLocal(
        email,
        password,
        rol,
        manager,
      );
      return this.generateAccessToken(user);
    });
  }

  async validateUser(email: string, password: string) {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario || !usuario.password) {
      throw new UnauthorizedException('User not found');
    }
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password: _p, refreshTokenHash, ...result } = usuario as any;
    return result;
  }

  async login(usuario: Usuario) {
    const access_token = await this.generateAccessToken(usuario);
    return {
      access_token,
      user: usuario,
    };
  }

  async forgotPassword(email: string): Promise<PasswordRecoveryResponse> {
    const normalizedEmail = email.trim().toLowerCase();
    const ttlMinutes = this.getPositiveConfigNumber(
      'PASSWORD_RESET_TOKEN_TTL_MINUTES',
      30,
    );
    const cooldownSeconds = this.getPositiveConfigNumber(
      'PASSWORD_RESET_COOLDOWN_SECONDS',
      60,
    );

    const pendingEmail = await this.dataSource.transaction(async (manager) => {
      const user = await this.usuariosService.findByEmailInsensitive(
        normalizedEmail,
        manager,
        true,
      );

      if (!user || user.provider !== 'local' || !user.password) {
        return null;
      }

      const tokenRepository = manager.getRepository(PasswordResetToken);
      const currentToken = await tokenRepository.findOne({
        where: { usuarioId: user.id },
        order: { createdAt: 'DESC' },
      });
      const now = new Date();
      if (
        currentToken &&
        now.getTime() - currentToken.createdAt.getTime() <
          cooldownSeconds * 1000
      ) {
        return null;
      }

      if (currentToken) {
        await tokenRepository.delete({ usuarioId: user.id });
      }

      const rawToken = randomBytes(32).toString('base64url');
      const resetToken = tokenRepository.create({
        usuarioId: user.id,
        tokenHash: this.hashResetToken(rawToken),
        expiresAt: new Date(now.getTime() + ttlMinutes * 60_000),
        usedAt: null,
      });
      const savedToken = await tokenRepository.save(resetToken);

      return {
        id: savedToken.id,
        email: user.email,
        rawToken,
      };
    });

    if (pendingEmail) {
      try {
        const resetUrl = this.buildPasswordResetUrl(pendingEmail.rawToken);
        await this.mailerService.sendPasswordReset(
          pendingEmail.email,
          resetUrl,
          ttlMinutes,
        );
      } catch (error) {
        this.logger.error(
          `No se pudo enviar el correo de recuperación para el token ${pendingEmail.id}: ${this.errorMessage(error)}`,
        );
        await this.invalidateUndeliveredToken(pendingEmail.id);
      }
    }

    return { message: PASSWORD_RECOVERY_MESSAGE };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<PasswordRecoveryResponse> {
    if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const tokenHash = this.hashResetToken(resetPasswordDto.token);
    await this.dataSource.transaction(async (manager) => {
      const now = new Date();
      const token = await manager
        .getRepository(PasswordResetToken)
        .createQueryBuilder('resetToken')
        .innerJoinAndSelect('resetToken.usuario', 'usuario')
        .setLock('pessimistic_write')
        .where('resetToken.tokenHash = :tokenHash', { tokenHash })
        .andWhere('resetToken.usedAt IS NULL')
        .andWhere('resetToken.expiresAt > :now', { now })
        .getOne();

      if (!token || token.usuario.provider !== 'local') {
        throw new BadRequestException(INVALID_PASSWORD_RESET_TOKEN_MESSAGE);
      }

      token.usuario.password = await bcrypt.hash(
        resetPasswordDto.newPassword,
        await bcrypt.genSalt(),
      );
      token.usuario.refreshTokenHash = null;
      token.usedAt = now;

      await manager.save(Usuario, token.usuario);
      await manager.save(PasswordResetToken, token);
    });

    return { message: 'Contraseña actualizada correctamente.' };
  }

  async oauthLogin(profile: {
    email: string;
    provider: Provider;
    providerId: string;
  }) {
    let user = await this.usuariosService.findByEmail(profile.email);
    if (!user) {
      user = await this.usuariosService.createOAuth(
        profile.email,
        profile.provider,
        profile.providerId,
        RolUsuario.ESTUDIANTE,
      );
    }
    const access_token = await this.generateAccessToken(user);
    return { access_token };
  }

  async logout(userId: string) {
    return {
      message: 'Logout successful',
    };
  }

  private generateAccessToken(usuario: Usuario) {
    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    const accessToken = this.jwtService.sign(payload);
    return accessToken;
  }

  private hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildPasswordResetUrl(rawToken: string): string {
    const configuredUrl = this.configService
      .get<string>('PASSWORD_RESET_FRONTEND_URL')
      ?.trim();
    if (!configuredUrl) {
      throw new Error('PASSWORD_RESET_FRONTEND_URL no está configurada');
    }

    const resetUrl = new URL(configuredUrl);
    resetUrl.searchParams.set('token', rawToken);
    return resetUrl.toString();
  }

  private getPositiveConfigNumber(key: string, fallback: number): number {
    const value = Number(this.configService.get<string | number>(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private async invalidateUndeliveredToken(tokenId: string): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.delete(PasswordResetToken, { id: tokenId });
      });
    } catch (error) {
      this.logger.error(
        `No se pudo invalidar el token de recuperación ${tokenId}: ${this.errorMessage(error)}`,
      );
    }
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  // async refreshTokens(refreshToken: string) {
  //     try {
  //         const payload = this.jwtService.verify(refreshToken, {
  //             secret: process.env.JWT_REFRESH_SECRET,
  //         });
  //         const usuario = await this.usuariosService.findOne(payload.sub);
  //         if (!usuario || !usuario.refreshTokenHash) {
  //             throw new UnauthorizedException('El usuario no existe');
  //         }
  //         const valid = await bcrypt.compare(refreshToken, usuario.refreshTokenHash);
  //         if (!valid) throw new UnauthorizedException('El refresh token no es válido');

  //         const access_token = this.generateAccessToken(usuario);
  //         return { access_token };
  //     } catch (error) {
  //         throw new UnauthorizedException('El refresh token no es válido');
  //     }
  // }
}
