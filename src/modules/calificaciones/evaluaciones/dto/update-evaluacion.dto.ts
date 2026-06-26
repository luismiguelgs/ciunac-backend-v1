import { PartialType } from '@nestjs/swagger';
import { CreateEvaluacioneDto } from './create-evaluacion.dto';

export class UpdateEvaluacioneDto extends PartialType(CreateEvaluacioneDto) {}
