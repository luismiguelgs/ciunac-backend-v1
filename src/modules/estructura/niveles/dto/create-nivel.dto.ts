import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateNivelDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsNumber()
    @IsNotEmpty()
    orden: number;
}
