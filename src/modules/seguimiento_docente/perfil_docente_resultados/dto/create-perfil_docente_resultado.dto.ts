import { IsInt, IsNumber, IsNotEmpty, Min, IsUUID } from 'class-validator';

export class CreatePerfilDocenteResultadoDto {
    @IsUUID()
    @IsNotEmpty()
    perfilDocenteId: string;

    @IsUUID()
    @IsNotEmpty()
    docenteId: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    resultadoFinal: number;

    @IsInt()
    @IsNotEmpty()
    moduloId: number;
}
