import { PartialType } from '@nestjs/swagger';
import { CreateEncuestaRespuestasDetalleDto } from './create-encuesta_respuestas_detalle.dto';

export class UpdateEncuestaRespuestasDetalleDto extends PartialType(CreateEncuestaRespuestasDetalleDto) { }

