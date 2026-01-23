import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateEncuestaRespuestaDto {
    @IsInt()
    @IsNotEmpty()
    grupoId: number;

    @IsInt()
    @IsNotEmpty()
    promedioPonderado: number;
}
