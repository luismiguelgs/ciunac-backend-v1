import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, ValidateIf } from 'class-validator';
import { RolUsuario } from 'src/modules/authentication/usuarios/entities/usuario.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(RolUsuario, { message: 'rol debe ser ESTUDIANTE, DOCENTE o ADMINISTRATIVO' })
  rol: RolUsuario;

  @ValidateIf((dto: RegisterDto) => dto.rol === RolUsuario.DOCENTE || dto.numeroDocumento !== undefined)
  @IsString()
  @IsNotEmpty({ message: 'numeroDocumento es obligatorio cuando el rol es DOCENTE' })
  numeroDocumento?: string;
}
