import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        console.log('register', registerDto);
        return this.authService.register(registerDto.email, registerDto.password, registerDto.rol);
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        return this.authService.login(user);
    }

    @Post('refresh')
    @HttpCode(200)
    async refresh(@Body('refresh_token') refresh_token: string) {
        return this.authService.refreshTokens(refresh_token);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Body('userId') userId: string) {
        await this.authService.logout(userId);
        return {ok: true, message: 'Logout exitoso'};
    }

     // Ejemplo de endpoint protegido
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req) {
        return {
            message: 'Ruta protegida OK',
            user: req.user, // viene del payload del JWT
        };
    }
}