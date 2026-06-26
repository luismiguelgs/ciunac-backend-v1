import { PartialType } from '@nestjs/swagger';
import { CreateEncuestaRespuestaDto } from './create-encuesta_respuesta.dto';

export class UpdateEncuestaRespuestaDto extends PartialType(CreateEncuestaRespuestaDto) {}
