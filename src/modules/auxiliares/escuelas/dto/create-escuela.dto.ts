import { IsString, IsNumber, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TIPOS_ESCUELA } from 'src/shared/types/tipo-academico';
import type { TipoEscuela } from 'src/shared/types/tipo-academico';

export class CreateEscuelaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  @IsNotEmpty()
  facultadId: number;

  @ApiProperty({ type: String, enum: [...TIPOS_ESCUELA], example: 'PRE' })
  @IsIn(TIPOS_ESCUELA)
  tipo: TipoEscuela;
}
