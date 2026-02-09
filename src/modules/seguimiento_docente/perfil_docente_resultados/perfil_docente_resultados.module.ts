import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilDocenteResultadosService } from './perfil_docente_resultados.service';
import { PerfilDocenteResultadosController } from './perfil_docente_resultados.controller';
import { PerfilDocenteResultado } from './entities/perfil_docente_resultado.entity';
import { EncuestaMetricasDocente } from '../encuesta_metricas_docente/entities/encuesta_metricas_docente.entity';
import { CumplimientoDocente } from '../cumplimiento_docente/entities/cumplimiento_docente.entity';
import { PerfilDocente } from '../perfil_docente/entities/perfil_docente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PerfilDocenteResultado,
      EncuestaMetricasDocente,
      CumplimientoDocente,
      PerfilDocente,
    ]),
  ],
  controllers: [PerfilDocenteResultadosController],
  providers: [PerfilDocenteResultadosService],
  exports: [PerfilDocenteResultadosService],
})
export class PerfilDocenteResultadosModule { }
