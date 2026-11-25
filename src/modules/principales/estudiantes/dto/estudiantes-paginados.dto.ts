import { ApiProperty } from '@nestjs/swagger';
import { TIPOS_ESTUDIANTE } from 'src/shared/types/tipo-academico';
import type { TipoEstudiante } from 'src/shared/types/tipo-academico';

interface CatalogoEstudiante {
  id: number;
  nombre: string;
}

const catalogoNullable = {
  type: 'object' as const,
  nullable: true,
  properties: {
    id: { type: 'integer' as const },
    nombre: { type: 'string' as const },
  },
  required: ['id', 'nombre'],
  selfRequired: true,
};

export class EstudianteListadoDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  nombres: string;

  @ApiProperty()
  apellidos: string;

  @ApiProperty()
  tipoDocumento: string;

  @ApiProperty()
  numeroDocumento: string;

  @ApiProperty({ type: String, nullable: true })
  codigo: string | null;

  @ApiProperty({
    type: String,
    enum: [...TIPOS_ESTUDIANTE, null],
    nullable: true,
  })
  tipoEstudiante: TipoEstudiante | null;

  @ApiProperty({ type: String, nullable: true })
  idQ10: string | null;

  @ApiProperty({ type: 'integer', nullable: true })
  facultadId: number | null;

  @ApiProperty({ type: 'integer', nullable: true })
  escuelaId: number | null;

  @ApiProperty(catalogoNullable)
  facultad: CatalogoEstudiante | null;

  @ApiProperty(catalogoNullable)
  escuela: CatalogoEstudiante | null;
}

class PaginacionEstudiantesDto {
  @ApiProperty({ type: 'integer' })
  page: number;

  @ApiProperty({ type: 'integer' })
  limit: number;

  @ApiProperty({ type: 'integer' })
  total: number;

  @ApiProperty({ type: 'integer' })
  totalPages: number;
}

export class EstudiantesPaginadosDto {
  @ApiProperty({ type: [EstudianteListadoDto] })
  data: EstudianteListadoDto[];

  @ApiProperty({ type: PaginacionEstudiantesDto })
  meta: PaginacionEstudiantesDto;
}
