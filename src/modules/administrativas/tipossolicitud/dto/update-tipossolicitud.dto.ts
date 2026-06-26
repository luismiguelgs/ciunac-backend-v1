import { PartialType } from '@nestjs/swagger';
import { CreateTipossolicitudDto } from './create-tipossolicitud.dto';

export class UpdateTipossolicitudDto extends PartialType(CreateTipossolicitudDto) {}
