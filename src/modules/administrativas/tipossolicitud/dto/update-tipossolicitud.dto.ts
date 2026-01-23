import { PartialType } from '@nestjs/mapped-types';
import { CreateTipossolicitudDto } from './create-tipossolicitud.dto';

export class UpdateTipossolicitudDto extends PartialType(CreateTipossolicitudDto) {}
