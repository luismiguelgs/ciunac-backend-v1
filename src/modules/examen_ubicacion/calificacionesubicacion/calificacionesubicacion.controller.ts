import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CalificacionesubicacionService } from './calificacionesubicacion.service';
import { CreateCalificacionesubicacionDto } from './dto/create-calificacionesubicacion.dto';
import { UpdateCalificacionesubicacionDto } from './dto/update-calificacionesubicacion.dto';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('calificacionesubicacion')
export class CalificacionesubicacionController {
	constructor(private readonly calificacionesubicacionService: CalificacionesubicacionService) { }

	@Post()
	create(@Body() createCalificacionesubicacionDto: CreateCalificacionesubicacionDto) {
		return this.calificacionesubicacionService.create(createCalificacionesubicacionDto);
	}

	@Get()
	findAll() {
		return this.calificacionesubicacionService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.calificacionesubicacionService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateCalificacionesubicacionDto: UpdateCalificacionesubicacionDto) {
		return this.calificacionesubicacionService.update(+id, updateCalificacionesubicacionDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.calificacionesubicacionService.remove(+id);
	}
}
