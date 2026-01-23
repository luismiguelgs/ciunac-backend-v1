import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('grupos')
export class GruposController {
	constructor(private readonly gruposService: GruposService) { }

	@Post()
	create(@Body() createGrupoDto: CreateGrupoDto) {
		return this.gruposService.create(createGrupoDto);
	}

	@Get()
	findAll() {
		return this.gruposService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.gruposService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateGrupoDto: UpdateGrupoDto) {
		return this.gruposService.update(+id, updateGrupoDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.gruposService.remove(+id);
	}
}
