import { IsBoolean, IsNotEmpty, IsNumber, Min, Max } from "class-validator";
import { IsString } from "class-validator";


export class CreateNotasfinalDto {
    @IsNotEmpty({message: 'El estudiante es requerido'})
    @IsString()
    estudianteId: string;

    @IsNotEmpty({message: 'El grupo es requerido'})
    @IsNumber()
    grupoId: number;

    @IsNotEmpty({message: 'La nota es requerida'})
    @IsNumber()
    @Min(0)
    @Max(100)
    nota: number;

    @IsNotEmpty({message: 'El estado es requerido'})
    @IsBoolean()
    aprobado: boolean;
}
