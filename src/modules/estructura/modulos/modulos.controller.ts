import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ModulosService } from './modulos.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { Modulo } from './entities/modulo.entity';
import { UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('modulos')
export class ModulosController {
	constructor(private readonly modulosService: ModulosService) { }

	@Post()
	create(@Body() createModuloDto: CreateModuloDto): Promise<Modulo> {
		return this.modulosService.create(createModuloDto);
	}

	@Get()
	findAll(): Promise<Modulo[]> {
		return this.modulosService.findAll();
	}

	@Get('visibles')
	findAllVisibles(): Promise<Modulo[]> {
		return this.modulosService.findAllVisibles();
	}

	@Get(':id')
	findOne(@Param('id') id: string): Promise<Modulo | null> {
		return this.modulosService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateModuloDto: UpdateModuloDto): Promise<Modulo | null> {
		return this.modulosService.update(+id, updateModuloDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.modulosService.remove(+id);
	}
}
