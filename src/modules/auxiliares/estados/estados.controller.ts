import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstadosService } from './estados.service';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { EstadoReferencia } from './entities/estado.entity';
import { UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('estados')
export class EstadosController {
	constructor(private readonly estadosService: EstadosService) { }

	@Post()
	create(@Body() createEstadoDto: CreateEstadoDto) {
		return this.estadosService.create(createEstadoDto);
	}

	@Get()
	findAll() {
		return this.estadosService.findAll();
	}

	@Get('referencia/:referencia')
	findByReferencia(@Param('referencia') referencia: EstadoReferencia) {
		return this.estadosService.findByReferencia(referencia);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.estadosService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateEstadoDto: UpdateEstadoDto) {
		return this.estadosService.update(+id, updateEstadoDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.estadosService.remove(+id);
	}
}
