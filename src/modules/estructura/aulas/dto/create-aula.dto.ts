import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional } from "class-validator";

export class CreateAulaDto {
    @IsNumber()
    @IsNotEmpty()
    capacidad?: number;

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsEnum(['VIRTUAL','FISICA'])
    @IsNotEmpty()
    tipo: string;

    @IsString()
    @IsOptional()
    ubicacion: string;
}
