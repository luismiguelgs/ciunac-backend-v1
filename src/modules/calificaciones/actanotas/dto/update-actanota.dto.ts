import { PartialType } from '@nestjs/swagger';
import { CreateActaNotaDto } from './create-actanota.dto';

export class UpdateActaNotaDto extends PartialType(CreateActaNotaDto) {}
