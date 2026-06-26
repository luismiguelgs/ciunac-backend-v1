import { PartialType } from '@nestjs/swagger';
import { CreateActasexamenubicacionDto } from './create-actasexamenubicacion.dto';

export class UpdateActasexamenubicacionDto extends PartialType(CreateActasexamenubicacionDto) {}
