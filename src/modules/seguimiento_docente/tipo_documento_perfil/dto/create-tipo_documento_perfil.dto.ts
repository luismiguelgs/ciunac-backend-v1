import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTipoDocumentoPerfilDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsInt()
    @IsOptional()
    puntaje?: number;
}
