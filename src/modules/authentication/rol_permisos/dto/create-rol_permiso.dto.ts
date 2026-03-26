import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RolUsuario } from '../../usuarios/entities/usuario.entity';

export class CreateRolPermisoDto {
  @IsEnum(RolUsuario)
  @IsNotEmpty()
  rol: RolUsuario;

  @IsInt()
  @IsNotEmpty()
  permisoId: number;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
