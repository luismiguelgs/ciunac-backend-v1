import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { EncuestaMetricasDocenteService } from './encuesta_metricas_docente.service';
import { CreateEncuestaMetricasDocenteDto } from './dto/create-encuesta_metricas_docente.dto';

@Controller('encuesta-metricas-docente')
export class EncuestaMetricasDocenteController {
	constructor(private readonly encuestaMetricasDocenteService: EncuestaMetricasDocenteService) { }

	@Post()
	create(@Body() createEncuestaMetricasDocenteDto: CreateEncuestaMetricasDocenteDto) {
		return this.encuestaMetricasDocenteService.create(createEncuestaMetricasDocenteDto);
	}

	@Get()
	findAll(@Query('moduloId') moduloId?: string) {
		if (moduloId) {
			return this.encuestaMetricasDocenteService.findByPeriodo(Number(moduloId));
		}
		return this.encuestaMetricasDocenteService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.encuestaMetricasDocenteService.findOne(+id);
	}

}
