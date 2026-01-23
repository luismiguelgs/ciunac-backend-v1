import { IsInt, IsNotEmpty, IsString, IsPositive } from 'class-validator';

export class CreatePuntajeAcademicoAdministrativoDto {
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    academicoAdministrativoId: number;

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsInt()
    @IsNotEmpty()
    puntaje: number;
}
