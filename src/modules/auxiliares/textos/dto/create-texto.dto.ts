import { IsString, IsNotEmpty } from "class-validator";

export class CreateTextoDto {
    @IsString()
    @IsNotEmpty()
    codigo: string;

    @IsString()
    @IsNotEmpty()
    contenido: string;
}
