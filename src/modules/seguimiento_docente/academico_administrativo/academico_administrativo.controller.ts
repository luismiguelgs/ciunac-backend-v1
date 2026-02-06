import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AcademicoAdministrativoService } from './academico_administrativo.service';
import { CreateAcademicoAdministrativoDto } from './dto/create-academico_administrativo.dto';
import { UpdateAcademicoAdministrativoDto } from './dto/update-academico_administrativo.dto';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('academico-administrativo')
export class AcademicoAdministrativoController {
	constructor(private readonly academicoService: AcademicoAdministrativoService) { }

	@Post()
	create(@Body() createDto: CreateAcademicoAdministrativoDto) {
		return this.academicoService.create(createDto);
	}

	@Get()
	findAll() {
		return this.academicoService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.academicoService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateDto: UpdateAcademicoAdministrativoDto) {
		return this.academicoService.update(+id, updateDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.academicoService.remove(+id);
	}
}
