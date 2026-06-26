import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ProcesarFirmaDto {
  @IsString()
  @IsNotEmpty()
  constanciaId: string;

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
