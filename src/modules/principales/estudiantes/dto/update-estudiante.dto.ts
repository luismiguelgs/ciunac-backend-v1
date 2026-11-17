import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsDateString, Matches, ValidateIf } from 'class-validator';
import { CreateEstudianteDto } from './create-estudiante.dto';

export class UpdateEstudianteDto extends PartialType(
  OmitType(CreateEstudianteDto, ['fechaNacimiento'] as const),
) {
  @ApiPropertyOptional({
    type: String,
    format: 'date',
    example: '2000-01-01',
    description:
      'Fecha real YYYY-MM-DD. Omitir conserva la fecha; null no esta permitido.',
  })
  @ValidateIf(
    (_object: unknown, value: unknown): boolean => value !== undefined,
  )
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fechaNacimiento debe tener el formato YYYY-MM-DD',
  })
  fechaNacimiento?: string;
}
