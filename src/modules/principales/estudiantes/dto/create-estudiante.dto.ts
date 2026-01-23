import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsEnum, isNotEmpty } from 'class-validator';

export class CreateEstudianteDto {
 
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
    @IsDateString()
    fechaNacimiento: Date

    @IsNotEmpty()
    @IsString()
    tipoDocumento: string;

    @IsNotEmpty()
    @IsString()
    numeroDocumento: string;

    @IsNotEmpty()
    @IsString()
    celular: string;

    @IsOptional()
    @IsString()
    imgDoc: string;

    @IsOptional()
    @IsNumber()
    facultadId?: number;

    @IsOptional()
    @IsNumber()
    escuelaId?: number;

    @IsOptional()
    @IsString()
    codigo?: string;

    @IsOptional()
    @IsString()
    direccion: string;
}
