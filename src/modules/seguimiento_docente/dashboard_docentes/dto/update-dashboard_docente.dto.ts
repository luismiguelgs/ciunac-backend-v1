import { PartialType } from '@nestjs/mapped-types';
import { CreateDashboardDocenteDto } from './create-dashboard_docente.dto';

export class UpdateDashboardDocenteDto extends PartialType(CreateDashboardDocenteDto) {}
