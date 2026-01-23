import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateEncuestaRespuestasDetalleDto {
    @IsInt()
    @IsNotEmpty()
    encuestaId: number;

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
