import { PartialType } from '@nestjs/mapped-types';
import { CreatePerfilDocenteDto } from './create-perfil_docente.dto';

export class UpdatePerfilDocenteDto extends PartialType(CreatePerfilDocenteDto) {}
