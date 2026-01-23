import { PartialType } from '@nestjs/mapped-types';
import { CreateEncuestaRespuestaDto } from './create-encuesta_respuesta.dto';

export class UpdateEncuestaRespuestaDto extends PartialType(CreateEncuestaRespuestaDto) {}
