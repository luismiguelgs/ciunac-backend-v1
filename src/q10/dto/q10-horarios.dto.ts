import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class Q10HorariosDto {
    @IsNotEmpty()
    @IsNumber()
    periodo: number;

    @IsNotEmpty()
    @IsString()
    nombrePeriodo: string;
}
