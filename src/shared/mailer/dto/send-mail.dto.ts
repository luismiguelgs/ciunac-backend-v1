import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class SendMailDto {
    @IsString()
    @IsIn(['RANDOM', 'REGISTER', 'BECA', 'CERTIFICADO', 'UBICACION', 'RECAUDA', 'SOLICITUD_RECHAZADA'])
    type: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsNumber()
    number?: number;

    @IsOptional()
    @IsString()
    user?: string;

    @ValidateIf((dto: SendMailDto) => ['RECAUDA', 'SOLICITUD_RECHAZADA'].includes(dto.type))
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    motivo?: string;
}
