import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TextosService } from './textos.service';
import { CreateTextoDto } from './dto/create-texto.dto';
import { UpdateTextoDto } from './dto/update-texto.dto';
import { UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('textos')
export class TextosController {
	constructor(private readonly textosService: TextosService) { }

	@Post()
	create(@Body() createTextoDto: CreateTextoDto) {
		return this.textosService.create(createTextoDto);
	}

	@Get()
	findAll() {
		return this.textosService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.textosService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateTextoDto: UpdateTextoDto) {
		return this.textosService.update(id, updateTextoDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.textosService.remove(id);
	}
}
