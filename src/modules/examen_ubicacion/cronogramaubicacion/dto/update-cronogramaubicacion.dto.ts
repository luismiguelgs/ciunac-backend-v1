import { PartialType } from '@nestjs/swagger';
import { CreateCronogramaubicacionDto } from './create-cronogramaubicacion.dto';

export class UpdateCronogramaubicacionDto extends PartialType(CreateCronogramaubicacionDto) {}
