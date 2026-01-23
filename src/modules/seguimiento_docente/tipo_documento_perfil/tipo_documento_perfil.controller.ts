import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TipoDocumentoPerfilService } from './tipo_documento_perfil.service';
import { CreateTipoDocumentoPerfilDto } from './dto/create-tipo_documento_perfil.dto';
import { UpdateTipoDocumentoPerfilDto } from './dto/update-tipo_documento_perfil.dto';
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('tipos-documento-perfil')
export class TipoDocumentoPerfilController {
  constructor(private readonly tipoDocumentoPerfilService: TipoDocumentoPerfilService) { }

  @Post()
  create(@Body() createTipoDocumentoPerfilDto: CreateTipoDocumentoPerfilDto) {
    return this.tipoDocumentoPerfilService.create(createTipoDocumentoPerfilDto);
  }

  @Get()
  findAll() {
    return this.tipoDocumentoPerfilService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoDocumentoPerfilService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoDocumentoPerfilDto: UpdateTipoDocumentoPerfilDto) {
    return this.tipoDocumentoPerfilService.update(+id, updateTipoDocumentoPerfilDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoDocumentoPerfilService.remove(+id);
  }
}
