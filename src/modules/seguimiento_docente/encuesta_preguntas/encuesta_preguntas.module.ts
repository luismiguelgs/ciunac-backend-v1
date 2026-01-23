import { Module } from '@nestjs/common';
import { EncuestaPreguntasService } from './encuesta_preguntas.service';
import { EncuestaPreguntasController } from './encuesta_preguntas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncuestaPregunta } from './entities/encuesta_pregunta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EncuestaPregunta])],
  controllers: [EncuestaPreguntasController],
  providers: [EncuestaPreguntasService],
  exports: [EncuestaPreguntasService]
})
export class EncuestaPreguntasModule { }

