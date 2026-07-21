import {
  IsDateString,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePagosBancoDto {
  @IsOptional()
  @IsString()
  dniCodigo?: string;

  @IsOptional()
  @IsString()
  numeroVoucher?: string;

  @IsOptional()
  @IsString()
  alumno?: string;

  @IsOptional()
  @IsNumber()
  monto?: number;

  @IsOptional()
  @IsDateString()
  fechaPago?: string;

  @IsDefined()
  @IsDateString()
  fechaEfectiva: string;

  @IsOptional()
  @IsString()
  voucherRestante?: string;

  @IsOptional()
  @IsString()
  archivo?: string;
}
