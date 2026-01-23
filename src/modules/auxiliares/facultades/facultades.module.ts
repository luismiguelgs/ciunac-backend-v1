import { Module } from '@nestjs/common';
import { FacultadesService } from './facultades.service';
import { FacultadesController } from './facultades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facultad } from './entities/facultad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Facultad])],
  controllers: [FacultadesController],
  providers: [FacultadesService],
})
export class FacultadesModule {}
