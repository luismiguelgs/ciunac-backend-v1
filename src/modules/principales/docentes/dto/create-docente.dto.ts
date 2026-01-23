
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocenteDto {
    @IsNotEmpty()
    @IsString()
    nombres: string;

    @IsNotEmpty()
    @IsString()
    apellidos: string;

    @IsOptional()
    @IsEnum(['M', 'F'], { message: 'El género debe ser M o F' })
    genero: string;

    @IsOptional()
    @IsString()
    celular: string;

    @IsOptional()
    @IsDate()
    fechaNacimiento: Date

    @IsOptional()
    @IsString()
    numeroDocumento: string;

    @IsOptional()
    @IsString()
    tipoDocumento: string;

    @IsOptional()
    @IsBoolean()
    activo: boolean;
}
