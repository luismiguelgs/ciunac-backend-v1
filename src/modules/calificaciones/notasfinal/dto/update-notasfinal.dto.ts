import { PartialType } from '@nestjs/mapped-types';
import { CreateNotasfinalDto } from './create-notasfinal.dto';

export class UpdateNotasfinalDto extends PartialType(CreateNotasfinalDto) {}
