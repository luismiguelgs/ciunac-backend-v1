import { PartialType } from '@nestjs/mapped-types';
import { CreateEncuestaMetricasDocenteDto } from './create-encuesta_metricas_docente.dto';

export class UpdateEncuestaMetricasDocenteDto extends PartialType(CreateEncuestaMetricasDocenteDto) {}
