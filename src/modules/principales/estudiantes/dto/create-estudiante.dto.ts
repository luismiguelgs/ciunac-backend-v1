import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  IsIn,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TIPOS_ESTUDIANTE,
  TipoEstudiante,
} from 'src/shared/types/tipo-academico';

export class CreateEstudianteDto {
  @IsNotEmpty()
  @IsString()
  nombres: string;

  @IsNotEmpty()
  @IsString()
  apellidos: string;

  @IsOptional()
  @IsEnum(['M', 'F'], { message: 'El género debe ser M o F' })
  genero: string;

  @ApiProperty({
    type: String,
    format: 'date',
    example: '2000-01-01',
    description:
      'Fecha de nacimiento real en formato YYYY-MM-DD, sin hora ni zona horaria.',
  })
  @IsNotEmpty()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fechaNacimiento debe tener el formato YYYY-MM-DD',
  })
  fechaNacimiento: string;

  @IsNotEmpty()
  @IsString()
  tipoDocumento: string;

  @IsNotEmpty()
  @IsString()
  numeroDocumento: string;

  @IsNotEmpty()
  @IsString()
  celular: string;

  @IsOptional()
  @IsString()
  imgDoc: string;

  @ApiPropertyOptional({
    type: String,
    enum: [...TIPOS_ESTUDIANTE, null],
    nullable: true,
  })
  @IsOptional()
  @IsIn(TIPOS_ESTUDIANTE)
  tipoEstudiante?: TipoEstudiante | null;

  @IsOptional()
  @IsNumber()
  facultadId?: number;

  @IsOptional()
  @IsNumber()
  escuelaId?: number;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  direccion: string;

  @IsOptional()
  @IsString()
  email?: string;
}
