import { IsString, IsNotEmpty } from "class-validator";

export class CreateFacultadeDto {
    @IsNotEmpty()
    @IsString()
    codigo: string;
    
    @IsNotEmpty()
    @IsString()
    nombre: string;
}
