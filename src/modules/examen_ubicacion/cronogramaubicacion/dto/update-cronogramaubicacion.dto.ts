import { PartialType } from '@nestjs/mapped-types';
import { CreateCronogramaubicacionDto } from './create-cronogramaubicacion.dto';

export class UpdateCronogramaubicacionDto extends PartialType(CreateCronogramaubicacionDto) {}
