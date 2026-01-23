import { Module } from '@nestjs/common';
import { DetallesubicacionService } from './detallesubicacion.service';
import { DetallesubicacionController } from './detallesubicacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Detallesubicacion } from './entities/detallesubicacion.entity';
import { Estudiante } from 'src/modules/principales/estudiantes/entities/estudiante.entity';
import { Examenesubicacion } from 'src/modules/examen_ubicacion/examenesubicacion/entities/examenesubicacion.entity';
import { Calificacionesubicacion } from 'src/modules/examen_ubicacion/calificacionesubicacion/entities/calificacionesubicacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Detallesubicacion,
    Estudiante,
    Examenesubicacion,
    Calificacionesubicacion
  ])],
  controllers: [DetallesubicacionController],
  providers: [DetallesubicacionService],
})
export class DetallesubicacionModule { }
