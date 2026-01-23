import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PerfilDocenteService } from './perfil_docente.service';
import { CreatePerfilDocenteDto } from './dto/create-perfil_docente.dto';
import { UpdatePerfilDocenteDto } from './dto/update-perfil_docente.dto';
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('perfil-docente')
export class PerfilDocenteController {
  constructor(private readonly perfilDocenteService: PerfilDocenteService) { }

  @Post()
  create(@Body() createPerfilDocenteDto: CreatePerfilDocenteDto) {
    return this.perfilDocenteService.create(createPerfilDocenteDto);
  }

  @Get()
  findAll() {
    return this.perfilDocenteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perfilDocenteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePerfilDocenteDto: UpdatePerfilDocenteDto) {
    return this.perfilDocenteService.update(+id, updatePerfilDocenteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.perfilDocenteService.remove(+id);
  }
}
