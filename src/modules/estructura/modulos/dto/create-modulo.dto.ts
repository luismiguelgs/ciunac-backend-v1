import { IsString, IsNumber, IsDate, IsBoolean, IsOptional } from 'class-validator';

export class CreateModuloDto {
    @IsString()
    nombre: string;

    @IsDate()
    fechaInicio: Date;

    @IsDate()
    fechaFin: Date;

    @IsNumber()
    orden: number;

    @IsBoolean()
    @IsOptional()
    activo: boolean;
}
