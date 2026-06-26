import { PartialType } from '@nestjs/swagger';
import { CreateDashboardDocenteDto } from './create-dashboard_docente.dto';

export class UpdateDashboardDocenteDto extends PartialType(CreateDashboardDocenteDto) {}
