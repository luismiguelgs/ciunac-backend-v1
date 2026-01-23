import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FacultadesService } from './facultades.service';
import { CreateFacultadeDto } from './dto/create-facultade.dto';
import { UpdateFacultadeDto } from './dto/update-facultade.dto';
import { UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('facultades')
export class FacultadesController {
  constructor(private readonly facultadesService: FacultadesService) { }

  @Post()
  create(@Body() createFacultadeDto: CreateFacultadeDto) {
    return this.facultadesService.create(createFacultadeDto);
  }

  @Get()
  findAll() {
    return this.facultadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facultadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFacultadeDto: UpdateFacultadeDto) {
    return this.facultadesService.update(+id, updateFacultadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facultadesService.remove(+id);
  }
}
