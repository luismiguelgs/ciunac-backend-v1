import { PartialType } from '@nestjs/swagger';
import { CreateDetallesubicacionDto } from './create-detallesubicacion.dto';

export class UpdateDetallesubicacionDto extends PartialType(CreateDetallesubicacionDto) {}
