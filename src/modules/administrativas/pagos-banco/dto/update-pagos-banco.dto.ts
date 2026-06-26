import { PartialType } from '@nestjs/swagger';
import { CreatePagosBancoDto } from './create-pagos-banco.dto';

export class UpdatePagosBancoDto extends PartialType(CreatePagosBancoDto) {}
