import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ProcesarFirmaCertificadoDto {
  @IsString()
  @IsNotEmpty()
  certificadoId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fileId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  solicitudId?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  signedFileId?: string;
}
