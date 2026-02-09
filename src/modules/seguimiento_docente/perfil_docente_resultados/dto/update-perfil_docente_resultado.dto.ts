import { PartialType } from '@nestjs/mapped-types';
import { CreatePerfilDocenteResultadoDto } from './create-perfil_docente_resultado.dto';

export class UpdatePerfilDocenteResultadoDto extends PartialType(CreatePerfilDocenteResultadoDto) {}
