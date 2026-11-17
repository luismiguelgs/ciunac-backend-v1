import { Module } from '@nestjs/common';
import { EscuelasService } from './escuelas.service';
import { EscuelasController } from './escuelas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Escuela } from './entities/escuela.entity';
import { Facultad } from 'src/modules/auxiliares/facultades/entities/facultad.entity';
import { Estudiante } from 'src/modules/principales/estudiantes/entities/estudiante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Escuela, Facultad, Estudiante])],
  controllers: [EscuelasController],
  providers: [EscuelasService],
})
export class EscuelasModule {}
