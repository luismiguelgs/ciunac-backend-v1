import { Module } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { EvaluacionesController } from './evaluaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluacion } from './entities/evaluacion.entity';
import { Modulo } from 'src/modules/estructura/modulos/entities/modulo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Evaluacion,
    Modulo
  ])],
  controllers: [EvaluacionesController],
  providers: [EvaluacionesService],
})
export class EvaluacionesModule { }
