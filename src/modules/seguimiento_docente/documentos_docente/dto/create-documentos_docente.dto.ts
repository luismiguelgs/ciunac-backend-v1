import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, IsDate, Min } from 'class-validator';

export class CreateDocumentosDocenteDto {
    @IsInt()
    @IsNotEmpty()
    perfilDocenteId: number;

    @IsInt()
    @IsNotEmpty()
    tipoDocumentoPerfilId: number;

    @IsInt()
    @IsNotEmpty()
    estadoId: number;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsString()
    @IsNotEmpty()
    institucionEmisora: string;

    @IsUrl()
    @IsNotEmpty()
    urlArchivo: string;

    @IsDate()
    @IsOptional()
    fechaEmision?: Date;

    @IsInt()
    @Min(0)
    @IsOptional()
    horasCapacitacion?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    puntaje?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    experienciaLaboral?: number;
}
