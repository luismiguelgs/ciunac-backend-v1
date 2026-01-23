import { Module } from '@nestjs/common';
import { EscuelasService } from './escuelas.service';
import { EscuelasController } from './escuelas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Escuela } from './entities/escuela.entity';
import { Facultad } from 'src/modules/auxiliares/facultades/entities/facultad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Escuela, Facultad])],
  controllers: [EscuelasController],
  providers: [EscuelasService],
})
export class EscuelasModule { }
