import { PartialType } from '@nestjs/mapped-types';
import { CreateActasexamenubicacionDto } from './create-actasexamenubicacion.dto';

export class UpdateActasexamenubicacionDto extends PartialType(CreateActasexamenubicacionDto) {}
