import { PartialType } from '@nestjs/mapped-types';
import { CreateEscuelaDto } from './create-escuela.dto';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateEscuelaDto extends PartialType(CreateEscuelaDto) {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsNumber()
    facultadId?: number;
}
