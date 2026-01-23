import { IsBoolean, IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateDetallesubicacionDto {
    @IsNotEmpty()
    @IsNumber()
    solicitudId: number;

    @IsNotEmpty()
    @IsNumber()
    idiomaId: number;

    @IsNotEmpty()
    @IsNumber()
    nivelId: number;

    @IsNotEmpty()
    @IsNumber()
    examenId: number;

    @IsNotEmpty()
    @IsString()
    estudianteId: string;

    @IsNotEmpty()
    @IsNumber()
    nota: number;

    @IsNotEmpty()
    @IsNumber()
    calificacionId: number;

    @IsNotEmpty()
    @IsBoolean()
    terminado: boolean;

    @IsOptional()
    @IsBoolean()
    activo: boolean;
}
