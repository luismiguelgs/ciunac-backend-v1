import { PartialType } from '@nestjs/swagger';
import { CreateRolPermisoDto } from './create-rol_permiso.dto';

export class UpdateRolPermisoDto extends PartialType(CreateRolPermisoDto) {}
