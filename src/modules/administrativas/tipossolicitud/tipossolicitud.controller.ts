import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TipossolicitudService } from './tipossolicitud.service';
import { CreateTipossolicitudDto } from './dto/create-tipossolicitud.dto';
import { UpdateTipossolicitudDto } from './dto/update-tipossolicitud.dto';
import { UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('tipossolicitud')
export class TipossolicitudController {
	constructor(private readonly tipossolicitudService: TipossolicitudService) { }

	@Post()
	create(@Body() createTipossolicitudDto: CreateTipossolicitudDto) {
		return this.tipossolicitudService.create(createTipossolicitudDto);
	}

	@Get()
	findAll() {
		return this.tipossolicitudService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.tipossolicitudService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateTipossolicitudDto: UpdateTipossolicitudDto) {
		return this.tipossolicitudService.update(+id, updateTipossolicitudDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.tipossolicitudService.remove(+id);
	}
}
