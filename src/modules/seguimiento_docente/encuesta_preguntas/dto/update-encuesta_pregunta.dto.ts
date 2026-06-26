import { PartialType } from '@nestjs/swagger';
import { CreateEncuestaPreguntaDto } from './create-encuesta_pregunta.dto';

export class UpdateEncuestaPreguntaDto extends PartialType(CreateEncuestaPreguntaDto) {}
