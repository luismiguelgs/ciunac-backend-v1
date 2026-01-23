import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Usuario } from "src/modules/usuarios/usuarios/entities/usuario.entity";
import { AuthService } from "./auth.service";
import { UsuariosService } from "src/modules/usuarios/usuarios/usuarios.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule } from "@nestjs/config";
import { ConfigService } from "@nestjs/config";

@Module({
    imports: [
        TypeOrmModule.forFeature([Usuario]),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_SECRET'),
                signOptions: { expiresIn: '15m' },
            }),
            inject: [ConfigService],
        })
    ],
    providers: [
        AuthService,
        UsuariosService,
        JwtStrategy,
    ],
    controllers: [AuthController],
})
export class AuthModule { }