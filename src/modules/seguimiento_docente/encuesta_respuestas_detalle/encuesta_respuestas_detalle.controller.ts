import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EncuestaRespuestasDetalleService } from './encuesta_respuestas_detalle.service';
import { CreateEncuestaRespuestasDetalleDto } from './dto/create-encuesta_respuestas_detalle.dto';
import { UpdateEncuestaRespuestasDetalleDto } from './dto/update-encuesta_respuestas_detalle.dto';

@Controller('encuesta-respuestas-detalle')
export class EncuestaRespuestasDetalleController {
  constructor(private readonly encuestaRespuestasDetalleService: EncuestaRespuestasDetalleService) {}

  @Post()
  create(@Body() createEncuestaRespuestasDetalleDto: CreateEncuestaRespuestasDetalleDto) {
    return this.encuestaRespuestasDetalleService.create(createEncuestaRespuestasDetalleDto);
  }

  @Get()
  findAll() {
    return this.encuestaRespuestasDetalleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.encuestaRespuestasDetalleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEncuestaRespuestasDetalleDto: UpdateEncuestaRespuestasDetalleDto) {
    return this.encuestaRespuestasDetalleService.update(+id, updateEncuestaRespuestasDetalleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.encuestaRespuestasDetalleService.remove(+id);
  }
}
