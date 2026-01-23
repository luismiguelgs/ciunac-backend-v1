import { PartialType } from '@nestjs/mapped-types';
import { CreateModuloDto } from './create-modulo.dto';
import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

export class UpdateModuloDto extends PartialType(CreateModuloDto) {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsDate()
    fechaInicio?: Date;

    @IsOptional()
    @IsDate()
    fechaFin?: Date;

    @IsOptional()
    @IsNumber()
    orden?: number;
}
