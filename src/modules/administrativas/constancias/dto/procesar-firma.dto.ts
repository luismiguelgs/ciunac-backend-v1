import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ProcesarFirmaDto {
  @IsString()
  @IsNotEmpty()
  constanciaId: string;

  @IsString()
  @IsOptional()
  fileId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  solicitudId: number;
}
