import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluacioneDto } from './create-evaluacion.dto';

export class UpdateEvaluacioneDto extends PartialType(CreateEvaluacioneDto) {}
