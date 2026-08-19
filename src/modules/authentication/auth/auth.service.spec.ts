import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { UsuariosService } from 'src/modules/authentication/usuarios/usuarios.service';
import {
  RolUsuario,
  Usuario,
} from 'src/modules/authentication/usuarios/entities/usuario.entity';
import { DocentesService } from 'src/modules/principales/docentes/docentes.service';
import { MailerService } from 'src/shared/mailer/mailer.service';
import { DataSource, EntityManager } from 'typeorm';
import { AuthService } from './auth.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';

const GENERIC_MESSAGE =
  'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.';
const INVALID_TOKEN_MESSAGE =
  'El enlace de recuperación no es válido o ha expirado';

describe('AuthService', () => {
  let service: AuthService;
  let usuariosService: jest.Mocked<UsuariosService>;
  let docentesService: jest.Mocked<DocentesService>;
  let jwtService: jest.Mocked<JwtService>;
  let mailerService: jest.Mocked<MailerService>;
  let dataSource: { transaction: jest.Mock };
  let manager: EntityManager;
  let managerMock: {
    getRepository: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let tokenRepository: {
    findOne: jest.Mock;
    delete: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let resetTokenQuery: {
    innerJoinAndSelect: jest.Mock;
    setLock: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    getOne: jest.Mock;
  };

  beforeEach(async () => {
    resetTokenQuery = {
      innerJoinAndSelect: jest.fn(),
      setLock: jest.fn(),
      where: jest.fn(),
      andWhere: jest.fn(),
      getOne: jest.fn(),
    };
    resetTokenQuery.innerJoinAndSelect.mockReturnValue(resetTokenQuery);
    resetTokenQuery.setLock.mockReturnValue(resetTokenQuery);
    resetTokenQuery.where.mockReturnValue(resetTokenQuery);
    resetTokenQuery.andWhere.mockReturnValue(resetTokenQuery);

    tokenRepository = {
      findOne: jest.fn(),
      delete: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => ({
        ...data,
        id: 'reset-token-1',
        createdAt: new Date(),
      })),
      createQueryBuilder: jest.fn().mockReturnValue(resetTokenQuery),
    };

    managerMock = {
      getRepository: jest.fn().mockReturnValue(tokenRepository),
      save: jest.fn(async (_entity, data) => data),
      delete: jest.fn(),
    };
    manager = managerMock as unknown as EntityManager;

    const usuariosServiceMock = {
      findByEmail: jest.fn(),
      findByEmailInsensitive: jest.fn(),
      createLocal: jest.fn(),
    };
    const docentesServiceMock = {
      findByIdentificacion: jest.fn(),
      assignUsuario: jest.fn(),
    };
    const jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mocked-token'),
    };
    const configServiceMock = {
      get: jest.fn((key: string) => {
        const values: Record<string, string | number> = {
          PASSWORD_RESET_FRONTEND_URL:
            'https://admin.ciunac.site/restablecer-contrasena',
          PASSWORD_RESET_TOKEN_TTL_MINUTES: 30,
          PASSWORD_RESET_COOLDOWN_SECONDS: 60,
        };
        return values[key];
      }),
    };
    const mailerServiceMock = {
      sendPasswordReset: jest.fn(),
    };

    dataSource = {
      transaction: jest
        .fn()
        .mockImplementation(
          async (callback: (manager: EntityManager) => Promise<unknown>) =>
            await callback(manager),
        ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: usuariosServiceMock },
        { provide: DocentesService, useValue: docentesServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: DataSource, useValue: dataSource },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: MailerService, useValue: mailerServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuariosService = module.get(UsuariosService);
    docentesService = module.get(DocentesService);
    jwtService = module.get(JwtService);
    mailerService = module.get(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registers a non-docente user without linking docente', async () => {
    usuariosService.findByEmail.mockResolvedValue(null);
    usuariosService.createLocal.mockResolvedValue({
      id: 'user-1',
      email: 'demo@ciunac.edu.pe',
      rol: RolUsuario.ESTUDIANTE,
    } as Usuario);

    const result = await service.register(
      'demo@ciunac.edu.pe',
      'secret123',
      RolUsuario.ESTUDIANTE,
    );

    expect(result).toBe('mocked-token');
    expect(usuariosService.findByEmail).toHaveBeenCalledWith(
      'demo@ciunac.edu.pe',
      manager,
    );
    expect(usuariosService.createLocal).toHaveBeenCalledWith(
      'demo@ciunac.edu.pe',
      'secret123',
      RolUsuario.ESTUDIANTE,
      manager,
    );
    expect(docentesService.findByIdentificacion).not.toHaveBeenCalled();
    expect(docentesService.assignUsuario).not.toHaveBeenCalled();
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'demo@ciunac.edu.pe',
      rol: RolUsuario.ESTUDIANTE,
    });
  });

  it('fails when a docente register request does not include numeroDocumento', async () => {
    usuariosService.findByEmail.mockResolvedValue(null);

    await expect(
      service.register(
        'docente@ciunac.edu.pe',
        'secret123',
        RolUsuario.DOCENTE,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(usuariosService.createLocal).not.toHaveBeenCalled();
    expect(docentesService.findByIdentificacion).not.toHaveBeenCalled();
  });

  it('fails when the docente is not found by numeroDocumento', async () => {
    usuariosService.findByEmail.mockResolvedValue(null);
    docentesService.findByIdentificacion.mockResolvedValue(null);

    await expect(
      service.register(
        'docente@ciunac.edu.pe',
        'secret123',
        RolUsuario.DOCENTE,
        '12345678',
      ),
    ).rejects.toThrow(NotFoundException);
    expect(docentesService.findByIdentificacion).toHaveBeenCalledWith(
      '12345678',
      manager,
    );
    expect(usuariosService.createLocal).not.toHaveBeenCalled();
  });

  it('fails when the docente already has a linked user', async () => {
    usuariosService.findByEmail.mockResolvedValue(null);
    docentesService.findByIdentificacion.mockResolvedValue({
      id: 'docente-1',
      usuario_id: 'user-existing',
    } as never);

    await expect(
      service.register(
        'docente@ciunac.edu.pe',
        'secret123',
        RolUsuario.DOCENTE,
        '12345678',
      ),
    ).rejects.toThrow(ConflictException);
    expect(usuariosService.createLocal).not.toHaveBeenCalled();
    expect(docentesService.assignUsuario).not.toHaveBeenCalled();
  });

  it('links the docente with the new user when the role is DOCENTE', async () => {
    usuariosService.findByEmail.mockResolvedValue(null);
    docentesService.findByIdentificacion.mockResolvedValue({
      id: 'docente-1',
      usuario_id: null,
    } as never);
    usuariosService.createLocal.mockResolvedValue({
      id: 'user-1',
      email: 'docente@ciunac.edu.pe',
      rol: RolUsuario.DOCENTE,
    } as Usuario);
    docentesService.assignUsuario.mockResolvedValue({
      id: 'docente-1',
      usuario_id: 'user-1',
    } as never);

    const result = await service.register(
      'docente@ciunac.edu.pe',
      'secret123',
      RolUsuario.DOCENTE,
      '12345678',
    );

    expect(result).toBe('mocked-token');
    expect(docentesService.assignUsuario).toHaveBeenCalledWith(
      'docente-1',
      'user-1',
      manager,
    );
  });

  it('fails when the email is already registered', async () => {
    usuariosService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'demo@ciunac.edu.pe',
    } as Usuario);

    await expect(
      service.register(
        'demo@ciunac.edu.pe',
        'secret123',
        RolUsuario.DOCENTE,
        '12345678',
      ),
    ).rejects.toThrow(ConflictException);
    expect(usuariosService.createLocal).not.toHaveBeenCalled();
    expect(docentesService.findByIdentificacion).not.toHaveBeenCalled();
  });

  describe('forgotPassword', () => {
    const localUser = {
      id: 'user-1',
      email: 'Usuario@CIUNAC.edu.pe',
      provider: 'local',
      password: 'stored-hash',
    } as Usuario;

    it('persists only the token hash and sends the configured reset URL', async () => {
      usuariosService.findByEmailInsensitive.mockResolvedValue(localUser);
      tokenRepository.findOne.mockResolvedValue(null);

      const result = await service.forgotPassword('  Usuario@CIUNAC.edu.pe  ');

      expect(result).toEqual({ message: GENERIC_MESSAGE });
      expect(usuariosService.findByEmailInsensitive).toHaveBeenCalledWith(
        'usuario@ciunac.edu.pe',
        manager,
        true,
      );
      expect(tokenRepository.save).toHaveBeenCalledTimes(1);
      expect(mailerService.sendPasswordReset).toHaveBeenCalledTimes(1);

      const [, resetUrl, ttl] = mailerService.sendPasswordReset.mock.calls[0];
      const rawToken = new URL(resetUrl).searchParams.get('token');
      expect(rawToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(ttl).toBe(30);
      expect(resetUrl).toContain(
        'https://admin.ciunac.site/restablecer-contrasena?token=',
      );

      const savedToken = tokenRepository.save.mock.calls[0][0];
      expect(savedToken.tokenHash).toBe(
        createHash('sha256')
          .update(rawToken as string)
          .digest('hex'),
      );
      expect(savedToken.tokenHash).not.toBe(rawToken);
      expect(savedToken.usuarioId).toBe(localUser.id);
      expect(savedToken.expiresAt.getTime()).toBeGreaterThan(
        Date.now() + 29 * 60_000,
      );
    });

    it.each([
      ['an unknown email', null],
      [
        'an OAuth account',
        {
          ...localUser,
          provider: 'google',
          password: undefined,
        } as Usuario,
      ],
    ])('returns the generic response for %s', async (_case, user) => {
      usuariosService.findByEmailInsensitive.mockResolvedValue(user);

      await expect(
        service.forgotPassword('usuario@ciunac.edu.pe'),
      ).resolves.toEqual({ message: GENERIC_MESSAGE });
      expect(tokenRepository.save).not.toHaveBeenCalled();
      expect(mailerService.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('does not issue another token during the cooldown', async () => {
      usuariosService.findByEmailInsensitive.mockResolvedValue(localUser);
      tokenRepository.findOne.mockResolvedValue({
        id: 'current-token',
        createdAt: new Date(Date.now() - 30_000),
      });

      await expect(service.forgotPassword(localUser.email)).resolves.toEqual({
        message: GENERIC_MESSAGE,
      });
      expect(tokenRepository.delete).not.toHaveBeenCalled();
      expect(tokenRepository.save).not.toHaveBeenCalled();
      expect(mailerService.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('replaces the previous token after the cooldown', async () => {
      usuariosService.findByEmailInsensitive.mockResolvedValue(localUser);
      tokenRepository.findOne.mockResolvedValue({
        id: 'old-token',
        createdAt: new Date(Date.now() - 61_000),
      });

      await service.forgotPassword(localUser.email);

      expect(tokenRepository.delete).toHaveBeenCalledWith({
        usuarioId: localUser.id,
      });
      expect(tokenRepository.save).toHaveBeenCalledTimes(1);
      expect(mailerService.sendPasswordReset).toHaveBeenCalledTimes(1);
    });

    it('invalidates the generated token when SMTP fails', async () => {
      jest.spyOn(Logger.prototype, 'error').mockImplementation();
      usuariosService.findByEmailInsensitive.mockResolvedValue(localUser);
      tokenRepository.findOne.mockResolvedValue(null);
      mailerService.sendPasswordReset.mockRejectedValue(
        new Error('SMTP unavailable'),
      );

      await expect(service.forgotPassword(localUser.email)).resolves.toEqual({
        message: GENERIC_MESSAGE,
      });
      expect(managerMock.delete).toHaveBeenCalledWith(PasswordResetToken, {
        id: 'reset-token-1',
      });
    });
  });

  describe('resetPassword', () => {
    const rawToken = 'a'.repeat(43);

    it('updates the password, clears refresh token and consumes the link', async () => {
      const user = {
        id: 'user-1',
        email: 'usuario@ciunac.edu.pe',
        provider: 'local',
        password: 'old-hash',
        refreshTokenHash: 'refresh-hash',
      } as Usuario;
      const resetToken = {
        id: 'reset-token-1',
        tokenHash: createHash('sha256').update(rawToken).digest('hex'),
        usedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        usuario: user,
      } as PasswordResetToken;
      resetTokenQuery.getOne.mockResolvedValue(resetToken);

      const result = await service.resetPassword({
        token: rawToken,
        newPassword: 'nueva-clave-segura',
        confirmPassword: 'nueva-clave-segura',
      });

      expect(result).toEqual({
        message: 'Contraseña actualizada correctamente.',
      });
      expect(resetTokenQuery.setLock).toHaveBeenCalledWith('pessimistic_write');
      expect(resetTokenQuery.where).toHaveBeenCalledWith(
        'resetToken.tokenHash = :tokenHash',
        {
          tokenHash: createHash('sha256').update(rawToken).digest('hex'),
        },
      );
      expect(await bcrypt.compare('nueva-clave-segura', user.password!)).toBe(
        true,
      );
      expect(user.refreshTokenHash).toBeNull();
      expect(resetToken.usedAt).toBeInstanceOf(Date);
      expect(managerMock.save).toHaveBeenNthCalledWith(1, Usuario, user);
      expect(managerMock.save).toHaveBeenNthCalledWith(
        2,
        PasswordResetToken,
        resetToken,
      );
    });

    it.each(['expired', 'used', 'altered', 'unknown'])(
      'returns the same error for an %s token',
      async () => {
        resetTokenQuery.getOne.mockResolvedValue(null);

        await expect(
          service.resetPassword({
            token: rawToken,
            newPassword: 'nueva-clave-segura',
            confirmPassword: 'nueva-clave-segura',
          }),
        ).rejects.toThrow(INVALID_TOKEN_MESSAGE);
      },
    );

    it('rejects different passwords before starting a transaction', async () => {
      await expect(
        service.resetPassword({
          token: rawToken,
          newPassword: 'nueva-clave-segura',
          confirmPassword: 'otra-clave-segura',
        }),
      ).rejects.toThrow('Las contraseñas no coinciden');
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });
  });
});
