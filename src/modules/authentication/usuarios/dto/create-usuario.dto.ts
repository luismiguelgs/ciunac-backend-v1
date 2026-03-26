import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

import { RolUsuario } from '../entities/usuario.entity';

export class CreateUsuarioDto {
    @IsEmail({}, { message: 'El email no tiene un formato válido' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @IsEnum(RolUsuario, { message: 'rol debe ser ESTUDIANTE, DOCENTE o ADMINISTRATIVO' })
    rol: RolUsuario;
}
