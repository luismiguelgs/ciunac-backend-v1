import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsuariosService } from "src/modules/usuarios/usuarios/usuarios.service";
import * as bcrypt from 'bcrypt';
import { Provider, RolUsuario, Usuario } from "src/modules/usuarios/usuarios/entities/usuario.entity";

@Injectable()
export class AuthService {
    constructor(
        private usuariosService: UsuariosService,
        private jwtService: JwtService
    ) { }

    async register(email: string, password: string, rol?: RolUsuario) {
        console.log('register', email, password, rol);
        const existe = await this.usuariosService.findByEmail(email);
        if (existe) {
            throw new UnauthorizedException('El usuario ya existe');
        }
        const user = await this.usuariosService.createLocal(email, password, rol);
        return this.generateAccessToken(user)
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
            user: usuario
        };
    }

    async oauthLogin(profile: { email: string; provider: Provider; providerId: string }) {
        let user = await this.usuariosService.findByEmail(profile.email)
        if (!user) {
            user = await this.usuariosService.createOAuth(
                profile.email,
                profile.provider,
                profile.providerId,
                RolUsuario.ESTUDIANTE,
            )
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