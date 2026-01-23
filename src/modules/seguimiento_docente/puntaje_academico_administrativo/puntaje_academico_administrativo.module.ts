import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PuntajeAcademicoAdministrativoService } from './puntaje_academico_administrativo.service';
import { PuntajeAcademicoAdministrativoController } from './puntaje_academico_administrativo.controller';
import { PuntajeAcademicoAdministrativo } from './entities/puntaje_academico_administrativo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PuntajeAcademicoAdministrativo])],
  controllers: [PuntajeAcademicoAdministrativoController],
  providers: [PuntajeAcademicoAdministrativoService],
  exports: [PuntajeAcademicoAdministrativoService],
})
export class PuntajeAcademicoAdministrativoModule { }
