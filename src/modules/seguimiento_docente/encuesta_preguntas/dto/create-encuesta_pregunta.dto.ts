import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateEncuestaPreguntaDto {
    @IsInt()
    @IsNotEmpty()
    orden: number;

    @IsString()
    @IsNotEmpty()
    textoPregunta: string;

    @IsString()
    @IsOptional()
    dimension?: string;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}

