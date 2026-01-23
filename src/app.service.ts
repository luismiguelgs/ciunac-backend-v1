import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppService {
	constructor(private jwtService: JwtService) {}

	getHello(): string {
		return 'Hello World from Docker!';
	}

	generarToken(payload: any) {
		const data = { sub: 1, username: payload.user }; // 👈 simulamos un usuario con id=1
  		return this.jwtService.sign(data);
	}

	validarToken(token: string) {
		try {
			return this.jwtService.verify(token);
		} catch (error) {
			return null;
		}
	}
}
