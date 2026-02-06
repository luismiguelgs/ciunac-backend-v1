import { Module } from '@nestjs/common';
import { EncuestaRespuestasService } from './encuesta_respuestas.service';
import { EncuestaRespuestasController } from './encuesta_respuestas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncuestaRespuesta } from './entities/encuesta_respuesta.entity';
import { Docente } from 'src/modules/principales/docentes/entities/docente.entity';
import { EncuestaRespuestasDetalle } from 'src/modules/seguimiento_docente/encuesta_respuestas_detalle/entities/encuesta_respuestas_detalle.entity';
import { DocentesModule } from 'src/modules/principales/docentes/docentes.module';
import { ModulosModule } from 'src/modules/estructura/modulos/modulos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EncuestaRespuesta, Docente, EncuestaRespuestasDetalle]),
    DocentesModule,
    ModulosModule
  ],
  controllers: [EncuestaRespuestasController],
  providers: [EncuestaRespuestasService],
})
export class EncuestaRespuestasModule { }

