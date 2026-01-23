import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CumplimientoDocenteService } from './cumplimiento_docente.service';
import { CreateCumplimientoDocenteDto } from './dto/create-cumplimiento_docente.dto';
import { UpdateCumplimientoDocenteDto } from './dto/update-cumplimiento_docente.dto';

@Controller('cumplimiento-docente')
export class CumplimientoDocenteController {
  constructor(private readonly cumplimientoDocenteService: CumplimientoDocenteService) { }

  @Post()
  create(@Body() createCumplimientoDocenteDto: CreateCumplimientoDocenteDto) {
    return this.cumplimientoDocenteService.create(createCumplimientoDocenteDto);
  }

  @Get()
  findAll() {
    return this.cumplimientoDocenteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cumplimientoDocenteService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCumplimientoDocenteDto: UpdateCumplimientoDocenteDto) {
    return this.cumplimientoDocenteService.update(id, updateCumplimientoDocenteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cumplimientoDocenteService.remove(id);
  }
}
