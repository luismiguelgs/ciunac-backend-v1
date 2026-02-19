import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DocumentosDocenteService } from './documentos_docente.service';
import { CreateDocumentosDocenteDto } from './dto/create-documentos_docente.dto';
import { UpdateDocumentosDocenteDto } from './dto/update-documentos_docente.dto';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('documentos-docente')
export class DocumentosDocenteController {
  	constructor(private readonly documentosDocenteService: DocumentosDocenteService) { }

	@Post()
	create(@Body() createDocumentosDocenteDto: CreateDocumentosDocenteDto) {
		return this.documentosDocenteService.create(createDocumentosDocenteDto);
	}

	@Get()
	findAll() {
		return this.documentosDocenteService.findAll();
	}

	@Get('perfil/:perfilDocenteId')
	findByPerfilDocenteId(@Param('perfilDocenteId') perfilDocenteId: string) {
		return this.documentosDocenteService.findByPerfilDocenteId(perfilDocenteId);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.documentosDocenteService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateDocumentosDocenteDto: UpdateDocumentosDocenteDto) {
		return this.documentosDocenteService.update(+id, updateDocumentosDocenteDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.documentosDocenteService.remove(+id);
	}
}
