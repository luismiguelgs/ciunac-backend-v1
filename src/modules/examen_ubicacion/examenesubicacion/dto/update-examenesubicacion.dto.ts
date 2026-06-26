import { PartialType } from '@nestjs/swagger';
import { CreateExamenesubicacionDto } from './create-examenesubicacion.dto';

export class UpdateExamenesubicacionDto extends PartialType(CreateExamenesubicacionDto) {}
