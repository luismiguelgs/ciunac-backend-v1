import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudbecaDto } from './create-solicitudbeca.dto';

export class UpdateSolicitudbecaDto extends PartialType(CreateSolicitudbecaDto) {}
