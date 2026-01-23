import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CronogramaubicacionService } from './cronogramaubicacion.service';
import { CreateCronogramaubicacionDto } from './dto/create-cronogramaubicacion.dto';
import { UpdateCronogramaubicacionDto } from './dto/update-cronogramaubicacion.dto';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('cronogramaubicacion')
export class CronogramaubicacionController {
	constructor(private readonly cronogramaubicacionService: CronogramaubicacionService) { }

	@Post()
	create(@Body() createCronogramaubicacionDto: CreateCronogramaubicacionDto) {
		return this.cronogramaubicacionService.create(createCronogramaubicacionDto);
	}

	@Get()
	findAll() {
		return this.cronogramaubicacionService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.cronogramaubicacionService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateCronogramaubicacionDto: UpdateCronogramaubicacionDto) {
		return this.cronogramaubicacionService.update(+id, updateCronogramaubicacionDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.cronogramaubicacionService.remove(+id);
	}
}
