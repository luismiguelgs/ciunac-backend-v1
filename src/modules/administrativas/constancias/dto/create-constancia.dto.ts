import { IsString, IsEnum, IsBoolean, IsNumber, IsOptional, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Modalidad, TipoConstancia } from "../schemas/constancia.schema";

class DetalleConstanciaDto {
    @IsString()
    idioma: string;

    @IsString()
    nivel: string;

    @IsString()
    ciclo: string;

    @IsEnum(Modalidad)
    modalidad: Modalidad;

    @IsString()
    mes: string;

    @IsString()
    año: string;

    @IsBoolean()
    aprobado: boolean;

    @IsNumber()
    nota: number;
}

export class CreateConstanciaDto {
    @IsEnum(TipoConstancia)
    tipo: TipoConstancia;

    @IsString()
    estudiante: string;

    @IsString()
    dni: string;

    @IsString()
    idioma: string;

    @IsNumber()
    idiomaId: number;

    @IsString()
    nivel: string;

    @IsNumber()
    nivelId: number;

    @IsString()
    ciclo: string;

    @IsBoolean()
    impreso: boolean;

    @IsNumber()
    solicitud_id: number;

    @IsOptional()
    @IsString()
    horario?: string;

    @IsString()
    url: string;

    @IsEnum(Modalidad)
    modalidad: Modalidad;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => DetalleConstanciaDto)
    detalle: DetalleConstanciaDto[];
}
