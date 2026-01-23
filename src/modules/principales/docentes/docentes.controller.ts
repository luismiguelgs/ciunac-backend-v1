import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocentesService } from './docentes.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('docentes')
export class DocentesController {
	constructor(private readonly docentesService: DocentesService) { }

	@Post()
	create(@Body() createDocenteDto: CreateDocenteDto) {
		return this.docentesService.create(createDocenteDto);
	}

	@Get()
	findAll() {
		return this.docentesService.findAll();
	}
	@Get('/activos')
	findActive() {
		return this.docentesService.findActive();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.docentesService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateDocenteDto: UpdateDocenteDto) {
		return this.docentesService.update(id, updateDocenteDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.docentesService.remove(id);
	}
}
