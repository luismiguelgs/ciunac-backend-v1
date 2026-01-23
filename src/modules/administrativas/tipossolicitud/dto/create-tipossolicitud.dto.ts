import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTipossolicitudDto {
    @IsNotEmpty({message: 'La solicitud es requerida'})
    @IsString()
    solicitud: string;

    @IsNotEmpty({message: 'El precio es requerido'})
    @IsNumber()
    precio: number;
}
