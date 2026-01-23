import { IsInt, IsNotEmpty, IsUUID, IsOptional, Min } from 'class-validator';

export class CreateCumplimientoDocenteDto {
    @IsInt()
    @IsNotEmpty()
    moduloId: number;

    @IsUUID()
    @IsNotEmpty()
    docenteId: string;

    @IsInt()
    @IsNotEmpty()
    academicoAdministrativoId: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    puntaje?: number;
}
