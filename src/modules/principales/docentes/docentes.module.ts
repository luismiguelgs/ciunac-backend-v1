import { Module } from '@nestjs/common';
import { DocentesService } from './docentes.service';
import { DocentesController } from './docentes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from './entities/docente.entity';
import { Usuario } from 'src/modules/usuarios/usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Docente,
    Usuario
  ])],
  controllers: [DocentesController],
  providers: [DocentesService],
  exports: [DocentesService],
})
export class DocentesModule { }
