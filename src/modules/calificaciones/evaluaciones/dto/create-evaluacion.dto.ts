import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEvaluacioneDto {
    @IsNotEmpty({message: 'El nombre es requerido'})
    @IsString()
    nombre: string;

    @IsNotEmpty({message: 'El porcentaje es requerido'})
    @IsNumber({maxDecimalPlaces: 2})
    porcentaje: number;

    @IsNotEmpty({message: 'El periodo es requerido'})
    @IsNumber()
    periodoId: number;

    @IsOptional()
    @IsBoolean()
    activo: boolean;
}
