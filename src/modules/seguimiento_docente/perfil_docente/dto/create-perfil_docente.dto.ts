import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { NivelIdioma } from '../entities/perfil_docente.entity';

export class CreatePerfilDocenteDto {
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    docenteId: string;

    @IsInt()
    @IsNotEmpty()
    experienciaTotal: number;

    @IsInt()
    @IsNotEmpty()
    idiomaId: number;

    @IsEnum(NivelIdioma)
    @IsOptional()
    nivelIdioma: NivelIdioma;

    @IsInt()
    @IsNotEmpty()
    puntajeFinal: number;
}
