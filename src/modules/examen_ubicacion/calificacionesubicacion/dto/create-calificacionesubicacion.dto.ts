import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateCalificacionesubicacionDto {
    @IsNotEmpty()
    @IsNumber()
    idiomaId: number;

    @IsNotEmpty()
    @IsNumber()
    nivelId: number;

    @IsNotEmpty()
    @IsNumber()
    cicloId: number;

    @IsNotEmpty()
    @IsNumber()
    notaMin: number;

    @IsNotEmpty()
    @IsNumber()
    notaMax: number;
}
