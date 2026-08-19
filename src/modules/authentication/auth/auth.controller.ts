import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordRecoveryResponse } from './interfaces/password-recovery-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.rol,
      registerDto.numeroDocumento,
    );
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<PasswordRecoveryResponse> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<PasswordRecoveryResponse> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // @Post('refresh')
  // @HttpCode(200)
  // async refresh(@Body('refresh_token') refresh_token: string) {
  //     return this.authService.refreshTokens(refresh_token);
  // }

  @Post('logout')
  @UseGuards(JwtAuthGuard, ApiKeyGuard)
  async logout(@Body('userId') userId: string) {
    await this.authService.logout(userId);
    return { ok: true, message: 'Logout exitoso' };
  }

  // Ejemplo de endpoint protegido
  @Get('profile')
  @UseGuards(JwtAuthGuard, ApiKeyGuard)
  getProfile(@Req() req) {
    return {
      message: 'Ruta protegida OK',
      user: req.user, // viene del payload del JWT
    };
  }
}
