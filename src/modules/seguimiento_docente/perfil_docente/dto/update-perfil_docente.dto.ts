import { PartialType } from '@nestjs/swagger';
import { CreatePerfilDocenteDto } from './create-perfil_docente.dto';

export class UpdatePerfilDocenteDto extends PartialType(CreatePerfilDocenteDto) {}
