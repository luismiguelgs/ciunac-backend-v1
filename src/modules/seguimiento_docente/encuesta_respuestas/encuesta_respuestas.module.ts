import { Module } from '@nestjs/common';
import { EncuestaRespuestasService } from './encuesta_respuestas.service';
import { EncuestaRespuestasController } from './encuesta_respuestas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncuestaRespuesta } from './entities/encuesta_respuesta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EncuestaRespuesta])],
  controllers: [EncuestaRespuestasController],
  providers: [EncuestaRespuestasService],
})
export class EncuestaRespuestasModule { }

