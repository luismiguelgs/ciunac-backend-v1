import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAcademicoAdministrativoDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsNumber()
    @IsNotEmpty()
    peso: number;
}
