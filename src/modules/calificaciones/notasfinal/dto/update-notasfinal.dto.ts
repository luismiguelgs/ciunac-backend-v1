import { PartialType } from '@nestjs/swagger';
import { CreateNotasfinalDto } from './create-notasfinal.dto';

export class UpdateNotasfinalDto extends PartialType(CreateNotasfinalDto) {}
