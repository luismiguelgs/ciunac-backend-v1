import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PerfilDocenteResultadosService } from './perfil_docente_resultados.service';
import { CreatePerfilDocenteResultadoDto } from './dto/create-perfil_docente_resultado.dto';
import { UpdatePerfilDocenteResultadoDto } from './dto/update-perfil_docente_resultado.dto';

@Controller('perfil-docente-resultados')
export class PerfilDocenteResultadosController {
  constructor(private readonly perfilDocenteResultadosService: PerfilDocenteResultadosService) { }

  @Post('generar')
  generarResultado(@Body() body: { moduloId: number; docenteId: string }) {
    return this.perfilDocenteResultadosService.generarResultado(body.moduloId, body.docenteId);
  }

  @Post()
  create(@Body() createPerfilDocenteResultadoDto: CreatePerfilDocenteResultadoDto) {
    return this.perfilDocenteResultadosService.create(createPerfilDocenteResultadoDto);
  }

  @Get()
  findAll() {
    return this.perfilDocenteResultadosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perfilDocenteResultadosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePerfilDocenteResultadoDto: UpdatePerfilDocenteResultadoDto) {
    return this.perfilDocenteResultadosService.update(+id, updatePerfilDocenteResultadoDto);
  }


}
