import { PartialType } from '@nestjs/mapped-types';
import { CreateEncuestaPreguntaDto } from './create-encuesta_pregunta.dto';

export class UpdateEncuestaPreguntaDto extends PartialType(CreateEncuestaPreguntaDto) {}
