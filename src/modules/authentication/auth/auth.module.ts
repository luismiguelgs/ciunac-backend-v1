import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { Usuario } from 'src/modules/authentication/usuarios/entities/usuario.entity';
import { AuthService } from './auth.service';
import { UsuariosService } from 'src/modules/authentication/usuarios/usuarios.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { RolesService } from './roles.service';
import { DocentesModule } from 'src/modules/principales/docentes/docentes.module';
import { MailerModule } from 'src/shared/mailer/mailer.module';
import { PasswordResetToken } from './entities/password-reset-token.entity';

@Module({
  imports: [
    CacheModule.register({
      ttl: 3600000, // 1 hora
    }),
    DocentesModule,
    MailerModule,
    TypeOrmModule.forFeature([Usuario, PasswordResetToken]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn:
            configService.get<string>('JWT_ACCESS_EXPIRATION') ?? '900s',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, UsuariosService, RolesService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, PassportModule, RolesService],
})
export class AuthModule {}
