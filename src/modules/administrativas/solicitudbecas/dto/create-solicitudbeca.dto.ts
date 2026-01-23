import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EstadoSolicitud } from '../schemas/solicitudbeca.schema';

export class CreateSolicitudbecaDto {
    @IsNotEmpty()
    @IsString()
    nombres: string;

    @IsNotEmpty()
    @IsString()
    apellidos: string;

    @IsNotEmpty()
    @IsString()
    telefono: string;

    @IsNotEmpty()
    @IsString()
    tipo_documento: string;

    @IsNotEmpty()
    @IsString()
    numero_documento: string;

    @IsNotEmpty()
    @IsString()
    facultad: string;

    @IsNotEmpty()
    @IsString()
    facultadId: string;

    @IsNotEmpty()
    @IsString()
    escuela: string;

    @IsOptional()
    @IsString()
    direccion: string;

    @IsNotEmpty()
    @IsString()
    escuelaId: string;

    @IsNotEmpty()
    @IsString()
    codigo: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    periodo: string;

    @IsNotEmpty()
    @IsString()
    carta_de_compromiso: string;

    @IsNotEmpty()
    @IsString()
    historial_academico: string;

    @IsNotEmpty()
    @IsString()
    constancia_matricula: string;

    @IsNotEmpty()
    @IsString()
    contancia_tercio: string;

    @IsNotEmpty()
    @IsString()
    declaracion_jurada: string;

    @IsOptional()
    @IsString()
    observaciones?: string;

    @IsOptional()
    @IsEnum(EstadoSolicitud)
    estado?: EstadoSolicitud;
}
