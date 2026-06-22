import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class RejectSolicitudDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'observaciones no puede contener solo espacios' })
  @MaxLength(1000)
  observaciones!: string;
}
