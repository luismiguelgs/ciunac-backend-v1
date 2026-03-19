import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesService } from "../roles.service";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly rolesService: RolesService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true; // Si no hay permisos definidos, todos pueden pasar
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user; // Ya viene validado por JwtAuthGuard

        if (!user) {
            throw new ForbiddenException('Usuario no autenticado');
        }

        if (user.rol === process.env.EXCEPTION_ROLE) {
            return true;
        }

        // Obtenemos todos los permisos reales de ese rol desde la base de datos
        const permissions = await this.rolesService.getPermissionsByRole(user.rol);

        // Verificamos si el usuario tiene TODOS los permisos requeridos
        const hasAllPermissions = requiredPermissions.every(perm => permissions.includes(perm));

        if (!hasAllPermissions) {
            throw new ForbiddenException('No tienes permiso para realizar esta acción');
        }

        return true;
    }
}