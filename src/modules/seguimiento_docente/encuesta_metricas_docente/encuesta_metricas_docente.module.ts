import { Module } from '@nestjs/common';
import { EncuestaMetricasDocenteService } from './encuesta_metricas_docente.service';
import { EncuestaMetricasDocenteController } from './encuesta_metricas_docente.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { EncuestaMetricasDocente } from './entities/encuesta_metricas_docente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EncuestaMetricasDocente])],
  controllers: [EncuestaMetricasDocenteController],
  providers: [EncuestaMetricasDocenteService],
})
export class EncuestaMetricasDocenteModule { }
