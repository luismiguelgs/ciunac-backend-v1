import { PartialType } from '@nestjs/swagger';
import { CreateSolicitudbecaDto } from './create-solicitudbeca.dto';

export class UpdateSolicitudbecaDto extends PartialType(CreateSolicitudbecaDto) {}
