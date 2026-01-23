import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EscuelasService } from './escuelas.service';
import { CreateEscuelaDto } from './dto/create-escuela.dto';
import { UpdateEscuelaDto } from './dto/update-escuela.dto';
import { Escuela } from './entities/escuela.entity';
import { UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('escuelas')
export class EscuelasController {
	constructor(private readonly escuelasService: EscuelasService) { }

	@Post()
	create(@Body() createEscuelaDto: CreateEscuelaDto): Promise<Escuela> {
		return this.escuelasService.create(createEscuelaDto);
	}

	@Get()
	findAll(): Promise<Escuela[]> {
		return this.escuelasService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string): Promise<Escuela | null> {
		return this.escuelasService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateEscuelaDto: UpdateEscuelaDto) {
		return this.escuelasService.update(+id, updateEscuelaDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.escuelasService.remove(+id);
	}
}
