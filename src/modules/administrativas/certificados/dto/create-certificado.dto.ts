import { IsBoolean, IsNumber, IsString, IsDateString, IsDate, IsOptional } from "class-validator";
import { Modalidad, TipoCertificado } from "../schemas/certificado.schema";
import { IsEnum, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class NotaCertificadoDto {
    @IsString()
    ciclo: string;

    @IsString()
    periodo: string;

    @IsEnum(Modalidad)
    modalidad: Modalidad;

    @IsNumber()
    nota: number;
}

export class CreateCertificadoDto {
    @IsEnum(TipoCertificado)
    tipo: TipoCertificado;

    @IsString()
    periodo: string;

    @IsString()
    estudiante: string;

    @IsString()
    numeroDocumento: string;

    @IsString()
    idioma: string;

    @IsNumber()
    idiomaId: number;

    @IsString()
    nivel: string;

    @IsNumber()
    nivelId: number;

    @IsNumber()
    cantidadHoras: number;

    @IsNumber()
    solicitudId: number;

    @Type(() => Date)
    @IsDate({ message: 'La fecha de emisión debe ser una fecha válida' })
    fechaEmision: Date;

    @IsString()
    numeroRegistro: string;

    @Type(() => Date)
    @IsDate({ message: 'La fecha de conclusión debe ser una fecha válida' })
    fechaConcluido: Date;
    
    @IsBoolean()
    curriculaAnterior: boolean;

    @IsBoolean()
    impreso: boolean;

    @IsBoolean()
    duplicado: boolean;

    @IsOptional()
    @IsString()
    certificadoOriginal: string;

    @IsString()
    elaboradoPor: string;

    @IsOptional()
    @IsString()
    url: string;

    @IsOptional()
    @IsBoolean()
    aceptado: boolean;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'La fecha de aceptación debe ser una fecha válida' })
    fechaAceptacion: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NotaCertificadoDto)
    notas: NotaCertificadoDto[];
}
