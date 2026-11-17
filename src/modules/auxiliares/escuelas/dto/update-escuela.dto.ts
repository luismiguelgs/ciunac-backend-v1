import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreateEscuelaDto } from './create-escuela.dto';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { TIPOS_ESCUELA } from 'src/shared/types/tipo-academico';
import type { TipoEscuela } from 'src/shared/types/tipo-academico';

export class UpdateEscuelaDto extends PartialType(
  OmitType(CreateEscuelaDto, ['tipo'] as const),
) {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsNumber()
  facultadId?: number;

  @ApiPropertyOptional({ type: String, enum: [...TIPOS_ESCUELA] })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsIn(TIPOS_ESCUELA)
  tipo?: TipoEscuela;
}
