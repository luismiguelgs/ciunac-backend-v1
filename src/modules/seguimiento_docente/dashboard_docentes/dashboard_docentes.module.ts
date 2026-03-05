import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardDocentesService } from './dashboard_docentes.service';
import { DashboardDocentesController } from './dashboard_docentes.controller';
import { PerfilDocenteResultado } from '../perfil_docente_resultados/entities/perfil_docente_resultado.entity';
import { EncuestaMetricasDocente } from '../encuesta_metricas_docente/entities/encuesta_metricas_docente.entity';
import { EncuestaRespuesta } from '../encuesta_respuestas/entities/encuesta_respuesta.entity';
import { Docente } from '../../principales/docentes/entities/docente.entity';
import { CumplimientoDocente } from '../cumplimiento_docente/entities/cumplimiento_docente.entity';
import { PerfilDocente } from '../perfil_docente/entities/perfil_docente.entity';
import { DocumentosDocente } from '../documentos_docente/entities/documentos_docente.entity';
import { EncuestaRespuestasDetalle } from '../encuesta_respuestas_detalle/entities/encuesta_respuestas_detalle.entity';
import { ModulosModule } from '../../estructura/modulos/modulos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PerfilDocenteResultado,
      EncuestaMetricasDocente,
      EncuestaRespuesta,
      Docente,
      CumplimientoDocente,
      PerfilDocente,
      DocumentosDocente,
      EncuestaRespuestasDetalle,
    ]),
    ModulosModule,
  ],
  controllers: [DashboardDocentesController],
  providers: [DashboardDocentesService],
})
export class DashboardDocentesModule { }
