import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EncuestaRespuestasService } from './encuesta_respuestas.service';
import { CreateEncuestaRespuestaDto } from './dto/create-encuesta_respuesta.dto';
import { UpdateEncuestaRespuestaDto } from './dto/update-encuesta_respuesta.dto';

@Controller('encuesta-respuestas')
export class EncuestaRespuestasController {
  constructor(private readonly encuestaRespuestasService: EncuestaRespuestasService) {}

  @Post()
  create(@Body() createEncuestaRespuestaDto: CreateEncuestaRespuestaDto) {
    return this.encuestaRespuestasService.create(createEncuestaRespuestaDto);
  }

  @Get()
  findAll() {
    return this.encuestaRespuestasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.encuestaRespuestasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEncuestaRespuestaDto: UpdateEncuestaRespuestaDto) {
    return this.encuestaRespuestasService.update(+id, updateEncuestaRespuestaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.encuestaRespuestasService.remove(+id);
  }
}
