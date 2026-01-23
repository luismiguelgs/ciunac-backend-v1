import { IsString, IsNumber, IsDate } from 'class-validator';

export class CreateModuloDto {
    @IsString()
    nombre: string;

    @IsDate()
    fechaInicio: Date;

    @IsDate()
    fechaFin: Date;

    @IsNumber()
    orden: number;
}
