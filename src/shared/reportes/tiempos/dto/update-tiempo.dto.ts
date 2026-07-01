import { PartialType } from '@nestjs/swagger';
import { CreateTiempoDto } from './create-tiempo.dto';

export class UpdateTiempoDto extends PartialType(CreateTiempoDto) {}
