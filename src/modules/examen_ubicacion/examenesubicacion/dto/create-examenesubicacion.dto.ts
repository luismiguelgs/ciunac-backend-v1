import { IsString, IsNumber, IsNotEmpty, IsDate } from "class-validator";

export class CreateExamenesubicacionDto {
    @IsNotEmpty()
    @IsString()
    codigo: string;

    @IsNotEmpty()
    @IsDate()
    fecha: Date;

    @IsNotEmpty()
    @IsNumber()
    estadoId: number;

    @IsNotEmpty()
    @IsNumber()
    idiomaId: number;

    @IsNotEmpty()
    @IsString()
    docenteId: string;

    @IsNotEmpty()
    @IsNumber()
    aulaId: number;
}
