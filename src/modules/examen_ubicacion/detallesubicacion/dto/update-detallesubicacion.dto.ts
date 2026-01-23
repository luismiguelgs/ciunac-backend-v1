import { PartialType } from '@nestjs/mapped-types';
import { CreateDetallesubicacionDto } from './create-detallesubicacion.dto';

export class UpdateDetallesubicacionDto extends PartialType(CreateDetallesubicacionDto) {}
