
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateCicloDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsInt()
    numeroCiclo: number;

    @IsNotEmpty()
    @IsInt()
    idiomaId: number;

    @IsNotEmpty()
    @IsInt()
    nivelId: number;

    @IsNotEmpty()
    @IsString()
    codigo: string;
}
