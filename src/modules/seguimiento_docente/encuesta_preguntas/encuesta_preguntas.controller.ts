import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EncuestaPreguntasService } from './encuesta_preguntas.service';
import { CreateEncuestaPreguntaDto } from './dto/create-encuesta_pregunta.dto';
import { UpdateEncuestaPreguntaDto } from './dto/update-encuesta_pregunta.dto';

@Controller('encuesta-preguntas')
export class EncuestaPreguntasController {
  constructor(private readonly encuestaPreguntasService: EncuestaPreguntasService) {}

  @Post()
  create(@Body() createEncuestaPreguntaDto: CreateEncuestaPreguntaDto) {
    return this.encuestaPreguntasService.create(createEncuestaPreguntaDto);
  }

  @Get()
  findAll() {
    return this.encuestaPreguntasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.encuestaPreguntasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEncuestaPreguntaDto: UpdateEncuestaPreguntaDto) {
    return this.encuestaPreguntasService.update(+id, updateEncuestaPreguntaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.encuestaPreguntasService.remove(+id);
  }
}
