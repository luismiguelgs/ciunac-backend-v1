import { PartialType } from '@nestjs/mapped-types';
import { CreateCumplimientoDocenteDto } from './create-cumplimiento_docente.dto';

export class UpdateCumplimientoDocenteDto extends PartialType(CreateCumplimientoDocenteDto) { }
