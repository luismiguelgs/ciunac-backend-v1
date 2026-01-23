import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateEscuelaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  @IsNotEmpty()
  facultadId: number;
}
