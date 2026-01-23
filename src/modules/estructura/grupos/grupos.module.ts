import { Module } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { GruposController } from './grupos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from './entities/grupo.entity';
import { Modulo } from 'src/modules/estructura/modulos/entities/modulo.entity';
import { Ciclo } from 'src/modules/estructura/ciclos/entities/ciclo.entity';
import { Docente } from 'src/modules/principales/docentes/entities/docente.entity';
import { Aula } from 'src/modules/estructura/aulas/entities/aula.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Grupo,
    Modulo,
    Ciclo,
    Docente,
    Aula
  ])],
  controllers: [GruposController],
  providers: [GruposService],
  exports: [GruposService],
})
export class GruposModule { }
