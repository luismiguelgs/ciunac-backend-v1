import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class Q10EstudianteDto {

    @IsOptional()
    @IsString()
    Codigo_estudiante?: string;

    @IsNotEmpty()
    @IsString()
    Primer_nombre: string;

    @IsOptional()
    @IsString()
    Segundo_nombre?: string;

    @IsNotEmpty()
    @IsString()
    Primer_apellido: string;

    @IsNotEmpty()
    @IsString()
    Segundo_apellido: string;

    @IsNotEmpty()
    @IsEmail({}, { message: 'Email no válido' })
    Email: string;

    @IsNotEmpty()
    @IsEnum(['PE01', 'PE02', 'PE03'], { message: 'Tipo de identificación inválido' })
    Codigo_tipo_identificacion: string;

    @IsNotEmpty()
    @IsString()
    Numero_identificacion: string;
    
    @IsNotEmpty()
    @IsEnum(['M', 'F'], { message: 'Genero debe ser M o F' })
    Genero: string;

    @IsNotEmpty()
    @IsString()
    Fecha_nacimiento: string;

    @IsNotEmpty()
    @IsString()
    Telefono: string;

    @IsNotEmpty()
    @IsString()
    Celular: string;

    @IsOptional()
    @IsString()
    Direccion: string;

    @IsOptional()
    @IsString()
    Lugar_nacimiento: string;

    @IsOptional()
    @IsString()
    Lugar_residencia: string;

    @IsNotEmpty()
    @IsString()
    Codigo_programa:string;

    @IsOptional()
    @IsNumber()
    Consecutivo_sedejornada: number;        

    @IsOptional()
    @IsNumber()
    Consecutivo_periodo: number;
}