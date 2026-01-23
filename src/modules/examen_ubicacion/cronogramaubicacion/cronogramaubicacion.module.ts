import { Module } from '@nestjs/common';
import { CronogramaubicacionService } from './cronogramaubicacion.service';
import { CronogramaubicacionController } from './cronogramaubicacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cronogramaubicacion } from './entities/cronogramaubicacion.entity';
import { Modulo } from 'src/modules/estructura/modulos/entities/modulo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Cronogramaubicacion,
    Modulo
  ])],
  controllers: [CronogramaubicacionController],
  providers: [CronogramaubicacionService],
})
export class CronogramaubicacionModule { }
