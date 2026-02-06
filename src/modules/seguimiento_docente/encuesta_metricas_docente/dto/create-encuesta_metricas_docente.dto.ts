import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEncuestaMetricasDocenteDto {
    @IsString()
    @IsNotEmpty()
    docenteId: string;

    @IsInt()
    @IsNotEmpty()
    moduloId: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsNotEmpty()
    promedioGeneral: number;

    @IsInt()
    @IsNotEmpty()
    totalEncuestados: number;

    @IsInt()
    @IsNotEmpty()
    totalCursos: number;

    @IsDateString()
    @IsOptional()
    fechaRegistro?: Date;
}

