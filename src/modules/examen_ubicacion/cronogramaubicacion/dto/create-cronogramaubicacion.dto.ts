import { IsBoolean, IsDate, IsNotEmpty, IsNumber } from "class-validator";

export class CreateCronogramaubicacionDto {
    @IsNotEmpty()
    @IsNumber()
    moduloId: number;

    @IsNotEmpty()
    @IsDate()
    fecha: Date;

    @IsNotEmpty()
    @IsBoolean()
    activo: boolean;
}
