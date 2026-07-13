import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadCertificadoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fileId?: string;
}
