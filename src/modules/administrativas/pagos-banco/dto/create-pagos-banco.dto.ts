import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, IsBoolean } from 'class-validator';

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
  fechaPago?: Date;

  @IsOptional()
  @IsDateString()
  fechaEfectiva?: Date;

  @IsOptional()
  @IsString()
  voucherRestante?: string;

  @IsOptional()
  @IsString()
  archivo?: string;

  @IsOptional()
  @IsBoolean()
  verificado?: boolean;
}
