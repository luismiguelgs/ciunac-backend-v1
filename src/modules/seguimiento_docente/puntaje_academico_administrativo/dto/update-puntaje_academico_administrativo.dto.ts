import { PartialType } from '@nestjs/mapped-types';
import { CreatePuntajeAcademicoAdministrativoDto } from './create-puntaje_academico_administrativo.dto';

export class UpdatePuntajeAcademicoAdministrativoDto extends PartialType(CreatePuntajeAcademicoAdministrativoDto) { }
