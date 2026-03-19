import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from '@nestjs/cache-manager';
import { Usuario } from "src/modules/usuarios/usuarios/entities/usuario.entity";
import { AuthService } from "./auth.service";
import { UsuariosService } from "src/modules/usuarios/usuarios/usuarios.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule } from "@nestjs/config";
import { ConfigService } from "@nestjs/config";
import { RolesService } from "./roles.service";

@Module({
    imports: [
        CacheModule.register({
            ttl: 3600000, // 1 hora
        }),
        TypeOrmModule.forFeature([Usuario]),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION') ?? '900s',
                },
            }),
            inject: [ConfigService],
        })
    ],
    providers: [
        AuthService,
        UsuariosService,
        RolesService,
        JwtStrategy,
    ],
    controllers: [AuthController],
    exports: [
        AuthService,
        JwtStrategy,
        PassportModule,
        RolesService
    ]
})
export class AuthModule { }