import { IsEnum, IsNotEmpty } from "class-validator";
import { IsString } from "class-validator";
import { EstadoReferencia } from "../entities/estado.entity";

export class CreateEstadoDto {
    @IsNotEmpty({message: 'El nombre es requerido'})
    @IsString()
    nombre: string;

    @IsNotEmpty({message: 'La referencia es requerida'})
    @IsEnum(EstadoReferencia, {message: 'La referencia debe ser SOLICITUD, EXAMEN_UBICACION o CERTIFICADO'})
    referencia: EstadoReferencia;
}
