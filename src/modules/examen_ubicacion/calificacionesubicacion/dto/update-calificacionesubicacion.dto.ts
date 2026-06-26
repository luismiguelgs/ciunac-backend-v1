import { PartialType } from '@nestjs/swagger';
import { CreateCalificacionesubicacionDto } from './create-calificacionesubicacion.dto';

export class UpdateCalificacionesubicacionDto extends PartialType(CreateCalificacionesubicacionDto) {}
