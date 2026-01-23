import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ActasexamenubicacionService } from './actasexamenubicacion.service';
import { CreateActasexamenubicacionDto } from './dto/create-actasexamenubicacion.dto';
import { UpdateActasexamenubicacionDto } from './dto/update-actasexamenubicacion.dto';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('actasexamenubicacion')
export class ActasexamenubicacionController {
	constructor(private readonly actasexamenubicacionService: ActasexamenubicacionService) { }

	@Post()
	create(@Body() createActasexamenubicacionDto: CreateActasexamenubicacionDto) {
		return this.actasexamenubicacionService.create(createActasexamenubicacionDto);
	}

	@Get()
	findAll() {
		return this.actasexamenubicacionService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.actasexamenubicacionService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateActasexamenubicacionDto: UpdateActasexamenubicacionDto) {
		return this.actasexamenubicacionService.update(id, updateActasexamenubicacionDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.actasexamenubicacionService.remove(id);
	}
}
