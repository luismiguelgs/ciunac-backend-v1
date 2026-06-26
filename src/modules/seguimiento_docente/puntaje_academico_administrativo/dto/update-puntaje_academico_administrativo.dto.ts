import { PartialType } from '@nestjs/swagger';
import { CreatePuntajeAcademicoAdministrativoDto } from './create-puntaje_academico_administrativo.dto';

export class UpdatePuntajeAcademicoAdministrativoDto extends PartialType(CreatePuntajeAcademicoAdministrativoDto) { }
