import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import { UsuariosService } from "src/modules/usuarios/usuarios/usuarios.service";
import { UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly usuarioService: UsuariosService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false, // rechaza tokens expirados
			secretOrKey: process.env.JWT_ACCESS_SECRET as string, // same key used in JwtModule
		});
	}

	async validate(payload: any) {
		// lo que retorne aquí estará disponible en req.user
		const usuario = await this.usuarioService.findOne(payload.sub);
		if (!usuario) {
			throw new UnauthorizedException('Token inválido');
		}
		const { password, refreshToken, ...safe } = usuario as any;
		return safe;
	}
}