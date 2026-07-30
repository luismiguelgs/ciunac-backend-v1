import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreatePagosBancoDto } from './create-pagos-banco.dto';

export class UpdatePagosBancoDto extends PartialType(CreatePagosBancoDto) {
  @IsOptional()
  @IsBoolean()
  verificado?: boolean;
}
