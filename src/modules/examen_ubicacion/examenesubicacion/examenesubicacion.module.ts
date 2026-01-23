import { Module } from '@nestjs/common';
import { ExamenesubicacionService } from './examenesubicacion.service';
import { ExamenesubicacionController } from './examenesubicacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Examenesubicacion } from './entities/examenesubicacion.entity';
import { Aula } from 'src/modules/estructura/aulas/entities/aula.entity';
import { Docente } from 'src/modules/principales/docentes/entities/docente.entity';
import { Idioma } from 'src/modules/estructura/idiomas/entities/idioma.entity';
import { Estado } from 'src/modules/auxiliares/estados/entities/estado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Examenesubicacion,
    Aula,
    Docente,
    Idioma,
    Estado,
  ])],
  controllers: [ExamenesubicacionController],
  providers: [ExamenesubicacionService],
})
export class ExamenesubicacionModule { }
