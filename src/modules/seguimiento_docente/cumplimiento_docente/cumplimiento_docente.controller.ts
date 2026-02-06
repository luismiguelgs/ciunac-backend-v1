import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CumplimientoDocenteService } from './cumplimiento_docente.service';
import { CreateCumplimientoDocenteDto } from './dto/create-cumplimiento_docente.dto';
import { UpdateCumplimientoDocenteDto } from './dto/update-cumplimiento_docente.dto';

@Controller('cumplimiento-docente')
export class CumplimientoDocenteController {
	constructor(private readonly cumplimientoDocenteService: CumplimientoDocenteService) { }

	@Post()
	create(@Body() createCumplimientoDocenteDto: CreateCumplimientoDocenteDto) {
		return this.cumplimientoDocenteService.create(createCumplimientoDocenteDto);
	}

	@Get()
	findAll(
		@Query('moduloId') moduloId?: string,
		@Query('academicoAdministrativoId') academicoAdministrativoId?: string,
	) {
		return this.cumplimientoDocenteService.findAll(
			moduloId ? +moduloId : undefined,
			academicoAdministrativoId ? +academicoAdministrativoId : undefined,
		);
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.cumplimientoDocenteService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() updateCumplimientoDocenteDto: UpdateCumplimientoDocenteDto) {
		return this.cumplimientoDocenteService.update(id, updateCumplimientoDocenteDto);
	}
}
