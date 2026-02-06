import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateEncuestaRespuestasDetalleDto {
    @IsInt()
    @IsNotEmpty()
    respuestaId: number;

    @IsInt()
    @IsNotEmpty()
    preguntaId: number;

    @IsString()
    @IsNotEmpty()
    valorTexto: string;

    @IsInt()
    @IsNotEmpty()
    valorNumero: number;
}
