import { IsNotEmpty, IsString, IsNumber, IsArray, IsBoolean, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class NotaDto {
    @IsString()
    @IsNotEmpty()
    dni: string;

    @IsString()
    @IsNotEmpty()
    estudiante: string;

    @IsNumber()
    nota_final: number;

    @IsBoolean()
    aprobado: boolean;
}

export class CreateActaNotaDto {
    @IsNumber()
    @IsNotEmpty()
    grupo_id: number; // 🔗 referencia a grupo de PostgreSQL

    @IsString()
    @IsNotEmpty()
    docente_id: string;   // UUID de Postgres
    @IsString()
    docente_nombre: string; // Snapshot del nombre

    @IsString()
    @IsNotEmpty()
    periodo: string;

    @IsDateString()
    fecha_cierre: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NotaDto)
    notas: NotaDto[];
}
