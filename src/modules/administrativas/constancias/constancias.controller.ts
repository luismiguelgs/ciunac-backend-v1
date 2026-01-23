import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ConstanciasService } from './constancias.service';
import { CreateConstanciaDto } from './dto/create-constancia.dto';
import { UpdateConstanciaDto } from './dto/update-constancia.dto';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';
import { Constancia } from './schemas/constancia.schema';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('constancias')
export class ConstanciasController {
	constructor(private readonly constanciasService: ConstanciasService) { }

	@Post()
	create(@Body() createConstanciaDto: CreateConstanciaDto) {
		return this.constanciasService.create(createConstanciaDto);
	}

	@Get()
	findAll() {
		return this.constanciasService.findAll();
	}

	@Get('impresos')
	findByImpreso(@Query('impreso') impreso: string): Promise<Constancia[]> {
		const impresoBoolean = impreso === 'true';
		return this.constanciasService.findByImpreso(impresoBoolean);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.constanciasService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateConstanciaDto: UpdateConstanciaDto) {
		return this.constanciasService.update(id, updateConstanciaDto);
	}

	/* las constancias no se borran
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.constanciasService.remove(id);
	}
	*/
}
