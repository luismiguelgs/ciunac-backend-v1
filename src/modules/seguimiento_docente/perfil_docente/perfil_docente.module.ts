import { Module } from '@nestjs/common';
import { PerfilDocenteService } from './perfil_docente.service';
import { PerfilDocenteController } from './perfil_docente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilDocente } from './entities/perfil_docente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PerfilDocente])],
  controllers: [PerfilDocenteController],
  providers: [PerfilDocenteService],
  exports: [PerfilDocenteService],
})
export class PerfilDocenteModule {}
