import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

    // Puedes sobrescribir el método handleRequest para personalizar 
    // exactamente qué pasa si el token falla, no existe o expiró.
    handleRequest(err: any, user: any, info: any) {

        // Si hay un error de passport o no hay usuario (token no enviado o inválido)
        if (err || !user) {

            // Si el token expiró, la librería passport-jwt devuelve este mensaje específico en 'info'
            if (info && info.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Tu sesión ha expirado, por favor inicia sesión nuevamente');
            }

            // Si el token fue manipulado o simplemente no se envió el header Authorization
            throw new UnauthorizedException('Token de acceso inválido o no proporcionado');
        }

        // Si todo está bien, retornamos el usuario. 
        // Esto es lo que NestJS colocará en "request.user" para que luego lo lea el PermissionsGuard
        return user;
    }
}