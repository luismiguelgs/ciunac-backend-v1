import { Module } from '@nestjs/common';
import { NotasService } from './notas.service';
import { NotasController } from './notas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nota } from './entities/nota.entity';
import { Estudiante } from 'src/modules/principales/estudiantes/entities/estudiante.entity';
import { Grupo } from 'src/modules/estructura/grupos/entities/grupo.entity';
import { Evaluacion } from 'src/modules/calificaciones/evaluaciones/entities/evaluacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Nota,
    Estudiante,
    Grupo,
    Evaluacion,
  ])],
  controllers: [NotasController],
  providers: [NotasService],
})
export class NotasModule { }
