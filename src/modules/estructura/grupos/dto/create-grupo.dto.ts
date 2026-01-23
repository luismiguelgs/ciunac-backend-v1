import { IsInt, IsString, IsUUID } from "class-validator";

export class CreateGrupoDto {
    @IsString()
    codigo: string;

    @IsInt()
    moduloId: number;

    @IsInt()
    cicloId: number;

    @IsUUID()
    docenteId: string;

    @IsInt()
    aulaId: number;
}
