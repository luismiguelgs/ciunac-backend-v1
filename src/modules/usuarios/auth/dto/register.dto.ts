import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { RolUsuario } from 'src/modules/usuarios/usuarios/entities/usuario.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(RolUsuario, { message: 'rol debe ser ESTUDIANTE, DOCENTE o ADMINISTRATIVO' })
  rol: RolUsuario;
}
