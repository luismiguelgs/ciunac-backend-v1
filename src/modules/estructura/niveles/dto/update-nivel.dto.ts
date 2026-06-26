import { PartialType } from '@nestjs/swagger';
import { CreateNivelDto } from './create-nivel.dto';

export class UpdateNivelDto extends PartialType(CreateNivelDto) {}
