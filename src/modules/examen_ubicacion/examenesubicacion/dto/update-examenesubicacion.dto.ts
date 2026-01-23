import { PartialType } from '@nestjs/mapped-types';
import { CreateExamenesubicacionDto } from './create-examenesubicacion.dto';

export class UpdateExamenesubicacionDto extends PartialType(CreateExamenesubicacionDto) {}
