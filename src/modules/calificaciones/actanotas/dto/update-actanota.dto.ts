import { PartialType } from '@nestjs/mapped-types';
import { CreateActaNotaDto } from './create-actanota.dto';

export class UpdateActaNotaDto extends PartialType(CreateActaNotaDto) {}
