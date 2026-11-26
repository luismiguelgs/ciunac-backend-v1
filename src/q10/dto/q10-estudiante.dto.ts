import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  TIPOS_ESTUDIANTE,
  TipoEstudiante,
} from 'src/shared/types/tipo-academico';

const birthDatePattern = /^(?!0000)\d{4}-\d{2}-\d{2}(?:T00:00:00\.000Z)?$/;

export class Q10EstudianteDto {
  @IsNotEmpty()
  @IsString()
  Primer_nombre: string;

  @IsOptional()
  @IsString()
  Segundo_nombre?: string;

  @IsNotEmpty()
  @IsString()
  Primer_apellido: string;

  @IsNotEmpty()
  @IsString()
  Segundo_apellido: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Email no válido' })
  Email: string;

  @IsNotEmpty()
  @IsEnum(['PE01', 'PE02', 'PE03'], {
    message: 'Tipo de identificación inválido',
  })
  Codigo_tipo_identificacion: string;

  @IsNotEmpty()
  @IsString()
  Numero_identificacion: string;

  @IsNotEmpty()
  @IsEnum(['M', 'F'], { message: 'Genero debe ser M o F' })
  Genero: string;

  @ApiProperty({
    type: String,
    pattern: birthDatePattern.source,
    example: '2000-01-01',
    description:
      'Fecha real YYYY-MM-DD o YYYY-MM-DDT00:00:00.000Z. Q10 recibe YYYY-MM-DD sin conversion horaria.',
  })
  @Matches(birthDatePattern)
  @IsDateString({ strict: true })
  Fecha_nacimiento: string;

  @IsNotEmpty()
  @IsString()
  Telefono: string;

  @IsNotEmpty()
  @IsString()
  Celular: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Opcional; el backend usa Lima al registrar en Q10.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  Direccion?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'Opcional; el backend establece el lugar de nacimiento al registrar en Q10.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  Lugar_nacimiento?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'Opcional; el backend establece el lugar de residencia al registrar en Q10.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  Lugar_residencia?: string;

  @IsNotEmpty()
  @IsString()
  Codigo_programa: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Opcional; el backend utiliza su sede/jornada configurada.',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  Consecutivo_sedejornada?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Opcional; el backend resuelve el periodo de Q10.',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  Consecutivo_periodo?: number;

  @ApiPropertyOptional({
    type: 'integer',
    minimum: 1,
    nullable: true,
    example: 3,
    description:
      'ID de facultad del catalogo local. No se envia a Q10; null se omite.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  facultadId?: number | null;

  @ApiPropertyOptional({
    type: 'integer',
    minimum: 1,
    nullable: true,
    example: 8,
    description:
      'ID de escuela del catalogo local. No se envia a Q10; null se omite.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  escuelaId?: number | null;

  @ApiPropertyOptional({
    type: String,
    enum: [...TIPOS_ESTUDIANTE, null],
    nullable: true,
    example: 'PG',
    description: 'Tipo local del estudiante. No se envia a Q10; null se omite.',
  })
  @IsOptional()
  @IsIn(TIPOS_ESTUDIANTE)
  tipoEstudiante?: TipoEstudiante | null;

  @ApiPropertyOptional({
    type: String,
    minLength: 1,
    maxLength: 50,
    nullable: true,
    example: '0012345678',
    description:
      'Codigo de alumno local. Se recortan espacios de los extremos; null u omision conserva el valor anterior. No se envia a Q10.',
  })
  @Transform(
    ({ obj, key }) => {
      // Use the original input so implicit conversion cannot turn numbers into codes.
      const input: unknown = obj[key];
      return typeof input === 'string' ? input.trim() : input;
    },
    { toClassOnly: true },
  )
  @IsOptional()
  @IsString()
  @Length(1, 50)
  codigo?: string | null;

  @ApiPropertyOptional({
    type: String,
    format: 'uri',
    nullable: true,
    example: 'https://drive.google.com/file/d/ID_DEVUELTO_POR_UPLOAD/view',
    description:
      'URL absoluta HTTP/HTTPS (viewLink del upload DNIS). Se guarda en estudiantes.img_doc. La clave JSON es imgDoc. No se envia a Q10; null se omite.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  imgDoc?: string | null;
}
