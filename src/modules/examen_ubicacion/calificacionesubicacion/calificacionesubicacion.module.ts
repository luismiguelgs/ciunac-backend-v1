import { Module } from '@nestjs/common';
import { CalificacionesubicacionService } from './calificacionesubicacion.service';
import { CalificacionesubicacionController } from './calificacionesubicacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calificacionesubicacion } from './entities/calificacionesubicacion.entity';
import { Idioma } from 'src/modules/estructura/idiomas/entities/idioma.entity';
import { Nivel } from 'src/modules/estructura/niveles/entities/nivel.entity';
import { Ciclo } from 'src/modules/estructura/ciclos/entities/ciclo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Calificacionesubicacion,
    Idioma,
    Nivel,
    Ciclo
  ])],
  controllers: [CalificacionesubicacionController],
  providers: [CalificacionesubicacionService],
})
export class CalificacionesubicacionModule { }
