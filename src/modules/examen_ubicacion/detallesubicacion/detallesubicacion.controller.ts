import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetallesubicacionService } from './detallesubicacion.service';
import { CreateDetallesubicacionDto } from './dto/create-detallesubicacion.dto';
import { UpdateDetallesubicacionDto } from './dto/update-detallesubicacion.dto';
import { UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('detallesubicacion')
export class DetallesubicacionController {
	constructor(private readonly detallesubicacionService: DetallesubicacionService) { }

	@Post()
	create(@Body() createDetallesubicacionDto: CreateDetallesubicacionDto) {
		return this.detallesubicacionService.create(createDetallesubicacionDto);
	}

	@Get()
	findAll() {
		return this.detallesubicacionService.findAll();
	}

	@Get('examen/:id')
	findByExamen(@Param('id') id: string) {
		return this.detallesubicacionService.findByExamen(+id);
	}

	@Get('estudiante/documento/:documentNumber')
	findByDocumentNumber(@Param('documentNumber') documentNumber: string) {
		return this.detallesubicacionService.findByDocumentNumber(documentNumber);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.detallesubicacionService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateDetallesubicacionDto: UpdateDetallesubicacionDto) {
		return this.detallesubicacionService.update(+id, updateDetallesubicacionDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.detallesubicacionService.remove(+id);
	}
}
