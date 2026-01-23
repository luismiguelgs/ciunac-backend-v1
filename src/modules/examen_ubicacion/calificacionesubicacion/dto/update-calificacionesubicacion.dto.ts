import { PartialType } from '@nestjs/mapped-types';
import { CreateCalificacionesubicacionDto } from './create-calificacionesubicacion.dto';

export class UpdateCalificacionesubicacionDto extends PartialType(CreateCalificacionesubicacionDto) {}
