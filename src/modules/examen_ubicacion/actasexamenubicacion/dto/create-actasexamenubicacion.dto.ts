import { IsString, IsDate, IsArray, ValidateNested, IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class ParticipanteDto {
  @IsString()
  dni: string;

  @IsString()
  apellidos: string;

  @IsString()
  nombres: string;

  @IsString()
  nivel: string;

  @IsNumber()
  nota: number;

  @IsString()
  ubicacion: string;

  @IsBoolean()
  terminado: boolean;
}

export class CreateActasexamenubicacionDto {
    @IsString()
    @IsNotEmpty()
    codigo: string;

    @IsDate()
    fecha: Date;

    @IsString()
    salon: string;

    @IsString()
    docente: string;

    @IsString()
    idioma: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ParticipanteDto)
    participantes: ParticipanteDto[];
}
