import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PuntajeAcademicoAdministrativoService } from './puntaje_academico_administrativo.service';
import { CreatePuntajeAcademicoAdministrativoDto } from './dto/create-puntaje_academico_administrativo.dto';
import { UpdatePuntajeAcademicoAdministrativoDto } from './dto/update-puntaje_academico_administrativo.dto';

@Controller('puntaje-academico-administrativo')
export class PuntajeAcademicoAdministrativoController {
  constructor(private readonly puntajeAcademicoAdministrativoService: PuntajeAcademicoAdministrativoService) { }

  @Post()
  create(@Body() createPuntajeAcademicoAdministrativoDto: CreatePuntajeAcademicoAdministrativoDto) {
    return this.puntajeAcademicoAdministrativoService.create(createPuntajeAcademicoAdministrativoDto);
  }

  @Get()
  findAll() {
    return this.puntajeAcademicoAdministrativoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.puntajeAcademicoAdministrativoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePuntajeAcademicoAdministrativoDto: UpdatePuntajeAcademicoAdministrativoDto) {
    return this.puntajeAcademicoAdministrativoService.update(id, updatePuntajeAcademicoAdministrativoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.puntajeAcademicoAdministrativoService.remove(id);
  }
}
