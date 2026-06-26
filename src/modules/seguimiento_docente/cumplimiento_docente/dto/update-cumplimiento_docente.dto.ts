import { PartialType } from '@nestjs/swagger';
import { CreateCumplimientoDocenteDto } from './create-cumplimiento_docente.dto';

export class UpdateCumplimientoDocenteDto extends PartialType(CreateCumplimientoDocenteDto) { }
