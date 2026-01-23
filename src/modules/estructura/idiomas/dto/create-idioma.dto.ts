import { IsNotEmpty, IsString } from "class-validator";

export class CreateIdiomaDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;
}
