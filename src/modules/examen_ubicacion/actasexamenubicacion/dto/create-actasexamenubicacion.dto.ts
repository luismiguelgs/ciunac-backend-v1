import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreateActasexamenubicacionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  examenId: number;
}
