import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}
	//generar token
	@Get('login')
	login(@Query('user') user: string) {
		return this.appService.generarToken({ user });
	}
	//validar token
	@Get('validar')
	validar(@Query('token') token: string) {
		return this.appService.validarToken(token);
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('profile')
	getProfile(@Request() req) {
		return req.user;
	}
}
