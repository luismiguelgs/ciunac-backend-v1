import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { TIPOS_ESTUDIANTE } from 'src/shared/types/tipo-academico';

const TIPOS_FILTRO = [...TIPOS_ESTUDIANTE, 'SIN_CLASIFICAR'] as const;

export class ListarEstudiantesDto {
  @ApiPropertyOptional({
    type: 'integer',
    minimum: 1,
    maximum: Number.MAX_SAFE_INTEGER,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  page?: number;

  @ApiPropertyOptional({
    type: 'integer',
    minimum: 1,
    maximum: 100,
    default: 25,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description:
      'Coincidencia parcial por documento, codigo, nombres y apellidos o correo.',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;

  @ApiPropertyOptional({ enum: [...TIPOS_FILTRO] })
  @IsOptional()
  @IsIn(TIPOS_FILTRO)
  tipoEstudiante?: (typeof TIPOS_FILTRO)[number];

  @ApiPropertyOptional({ type: 'integer', minimum: 1, maximum: 2147483647 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  facultadId?: number;

  @ApiPropertyOptional({ type: 'integer', minimum: 1, maximum: 2147483647 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  escuelaId?: number;

  @ApiPropertyOptional({
    enum: ['true', 'false'],
    description: 'Presencia de un idQ10 local no vacio.',
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  vinculadoQ10?: 'true' | 'false';
}
