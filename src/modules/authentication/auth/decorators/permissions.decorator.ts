import { SetMetadata } from '@nestjs/common';

// Esta constante es la "llave" con la que NestJS guardará los permisos en la memoria
export const PERMISSIONS_KEY = 'permissions';

// Este es el decorador que usaremos en los controladores
export const RequirePermissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);