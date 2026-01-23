import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotasfinalService } from './notasfinal.service';
import { CreateNotasfinalDto } from './dto/create-notasfinal.dto';
import { UpdateNotasfinalDto } from './dto/update-notasfinal.dto';
import { UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('notasfinal')
export class NotasfinalController {
	constructor(private readonly notasfinalService: NotasfinalService) { }

	@Post()
	create(@Body() createNotasfinalDto: CreateNotasfinalDto) {
		return this.notasfinalService.create(createNotasfinalDto);
	}

	@Get()
	findAll() {
		return this.notasfinalService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.notasfinalService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateNotasfinalDto: UpdateNotasfinalDto) {
		return this.notasfinalService.update(+id, updateNotasfinalDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.notasfinalService.remove(+id);
	}
}
