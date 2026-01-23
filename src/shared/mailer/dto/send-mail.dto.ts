import { IsEmail, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class SendMailDto {
    @IsString()
    @IsIn(['RANDOM', 'REGISTER', 'BECA', 'CERTIFICADO', 'UBICACION'])
    type: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsNumber()
    number?: number;

    @IsOptional()
    @IsString()
    user?: string;
}
