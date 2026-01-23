import { Module } from '@nestjs/common';
import { CiclosService } from './ciclos.service';
import { CiclosController } from './ciclos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ciclo } from './entities/ciclo.entity';
import { Idioma } from 'src/modules/estructura/idiomas/entities/idioma.entity';
import { Nivel } from 'src/modules/estructura/niveles/entities/nivel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Ciclo,
    Idioma,
    Nivel
  ])],
  controllers: [CiclosController],
  providers: [CiclosService],
  exports: [CiclosService]
})
export class CiclosModule { }
