import { Module } from '@nestjs/common';
import { NotasfinalService } from './notasfinal.service';
import { NotasfinalController } from './notasfinal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notasfinal } from './entities/notasfinal.entity';
import { Estudiante } from 'src/modules/principales/estudiantes/entities/estudiante.entity';
import { Grupo } from 'src/modules/estructura/grupos/entities/grupo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Notasfinal,
    Estudiante,
    Grupo,
  ])],
  controllers: [NotasfinalController],
  providers: [NotasfinalService],
})
export class NotasfinalModule { }
