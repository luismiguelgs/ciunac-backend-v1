import { Module } from '@nestjs/common';
import { EncuestaRespuestasDetalleService } from './encuesta_respuestas_detalle.service';
import { EncuestaRespuestasDetalleController } from './encuesta_respuestas_detalle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncuestaRespuestasDetalle } from './entities/encuesta_respuestas_detalle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EncuestaRespuestasDetalle])],
  controllers: [EncuestaRespuestasDetalleController],
  providers: [EncuestaRespuestasDetalleService],
  exports: [EncuestaRespuestasDetalleService, TypeOrmModule.forFeature([EncuestaRespuestasDetalle])]
})
export class EncuestaRespuestasDetalleModule { }

