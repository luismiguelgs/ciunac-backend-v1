import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EstudiantesService } from './estudiantes.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { UseGuards } from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('estudiantes')
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear estudiante local',
    description:
      'Crea solo en PostgreSQL. fechaNacimiento es obligatoria y usa YYYY-MM-DD. imgDoc recibe el viewLink de POST /upload/DNIS; no recibe el binario ni el nombre SQL img_doc. Para alta Q10 usar POST /q10/estudiantes sin crear despues un duplicado local.',
  })
  @ApiBody({
    type: CreateEstudianteDto,
    examples: {
      alumnoNuevo: {
        value: {
          nombres: 'Ana',
          apellidos: 'Perez Lopez',
          genero: 'F',
          fechaNacimiento: '2000-01-01',
          tipoDocumento: 'DNI',
          numeroDocumento: '12345678',
          celular: '999999999',
          tipoEstudiante: 'PG',
          imgDoc: 'https://drive.google.com/file/d/ID_DEVUELTO_POR_UPLOAD/view',
        },
      },
    },
  })
  create(@Body() createEstudianteDto: CreateEstudianteDto) {
    return this.estudiantesService.create(createEstudianteDto);
  }

  @Get()
  findAll() {
    return this.estudiantesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estudiantesService.findOne(id);
  }
  @Get('/buscar/:dni')
  findByDni(@Param('dni') dni: string) {
    return this.estudiantesService.findByDni(dni);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar estudiante local',
    description:
      'fechaNacimiento es opcional; cuando se envia debe ser una fecha real YYYY-MM-DD y no puede ser null. tipoEstudiante admite PRE/POS/PG; imgDoc es la referencia de la imagen, no un archivo multipart.',
  })
  update(
    @Param('id') id: string,
    @Body() updateEstudianteDto: UpdateEstudianteDto,
  ) {
    return this.estudiantesService.update(id, updateEstudianteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estudiantesService.remove(id);
  }
}
