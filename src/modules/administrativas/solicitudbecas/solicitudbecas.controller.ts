import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { SolicitudbecasService } from './solicitudbecas.service';
import { CreateSolicitudbecaDto } from './dto/create-solicitudbeca.dto';
import { UpdateSolicitudbecaDto } from './dto/update-solicitudbeca.dto';
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';
import { EstadoSolicitud } from './schemas/solicitudbeca.schema';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('solicitudbecas')
export class SolicitudbecasController {
	constructor(private readonly solicitudbecasService: SolicitudbecasService) { }

	@Post()
	create(@Body() createSolicitudbecaDto: CreateSolicitudbecaDto) {
		return this.solicitudbecasService.create(createSolicitudbecaDto);
	}

	@Get()
	findAll() {
		return this.solicitudbecasService.findAll();
	}

	@Get('estado/:estado')
	findByEstado(@Param('estado') estado: EstadoSolicitud) {
		if (!Object.values(EstadoSolicitud).includes(estado)) {
			throw new BadRequestException('Estado inválido');
		}
		return this.solicitudbecasService.findByEstado(estado);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.solicitudbecasService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateSolicitudbecaDto: UpdateSolicitudbecaDto) {
		return this.solicitudbecasService.update(id, updateSolicitudbecaDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.solicitudbecasService.remove(id);
	}
}
