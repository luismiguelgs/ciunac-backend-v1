import { PartialType } from '@nestjs/swagger';
import { CreatePerfilDocenteResultadoDto } from './create-perfil_docente_resultado.dto';

export class UpdatePerfilDocenteResultadoDto extends PartialType(CreatePerfilDocenteResultadoDto) {}
