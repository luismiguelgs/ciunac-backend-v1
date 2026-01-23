import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { CreateEvaluacioneDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacioneDto } from './dto/update-evaluacion.dto';
import { UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('evaluaciones')
export class EvaluacionesController {
	constructor(private readonly evaluacionesService: EvaluacionesService) { }

	@Post()
	create(@Body() createEvaluacioneDto: CreateEvaluacioneDto) {
		return this.evaluacionesService.create(createEvaluacioneDto);
	}

	@Get()
	findAll() {
		return this.evaluacionesService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.evaluacionesService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateEvaluacioneDto: UpdateEvaluacioneDto) {
		return this.evaluacionesService.update(+id, updateEvaluacioneDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.evaluacionesService.remove(+id);
	}
}
