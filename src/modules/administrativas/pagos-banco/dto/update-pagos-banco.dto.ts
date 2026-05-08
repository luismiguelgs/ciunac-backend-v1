import { PartialType } from '@nestjs/mapped-types';
import { CreatePagosBancoDto } from './create-pagos-banco.dto';

export class UpdatePagosBancoDto extends PartialType(CreatePagosBancoDto) {}
