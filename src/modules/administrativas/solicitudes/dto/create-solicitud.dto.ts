import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSolicitudDto {
    @IsNotEmpty()
    @IsString()
    estudianteId: string;

    @IsNotEmpty()
    @IsNumber()
    tipoSolicitudId: number;

    @IsNotEmpty()
    @IsNumber()
    idiomaId: number;

    @IsNotEmpty()
    @IsNumber()
    nivelId: number;

    @IsNotEmpty()
    @IsNumber()
    estadoId: number;

    @IsNotEmpty()
    @IsString()
    periodo: string;

    @IsOptional()
    @IsBoolean()
    alumnoCiunac: boolean;

    @IsOptional()
    @IsDate()
    fechaPago: Date;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    pago: number;

    @IsOptional()
    @IsBoolean()
    digital: boolean;

    @IsOptional()
    @IsString()
    numeroVoucher: string;

    @IsOptional()
    @IsString()
    imgVoucher: string;

    @IsOptional()
    @IsString()
    imgCertEstudio: string;

    @IsOptional()
    @IsBoolean()
    manual: boolean;
}
