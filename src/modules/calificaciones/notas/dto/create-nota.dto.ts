import { IsNotEmpty, IsNumber, Max, Min } from "class-validator";
import { IsString } from "class-validator";


export class CreateNotaDto {
    @IsNotEmpty({message: 'El estudiante es requerido'})
    @IsString()
    estudianteId: string;

    @IsNotEmpty({message: 'El grupo es requerido'})
    @IsNumber()
    grupoId: number;

    @IsNotEmpty({message: 'La evaluación es requerida'})
    @IsNumber()
    evaluacionId: number;

    @IsNotEmpty({message: 'La nota es requerida'})
    @IsNumber()
    @Min(0)
    @Max(100)
    nota: number;
}
