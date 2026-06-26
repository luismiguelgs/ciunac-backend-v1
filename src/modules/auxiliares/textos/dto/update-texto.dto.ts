import { PartialType } from '@nestjs/swagger';
import { CreateTextoDto } from './create-texto.dto';

export class UpdateTextoDto extends PartialType(CreateTextoDto) {}
