import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Estudiante } from 'src/modules/principales/estudiantes/entities/estudiante.entity';
import { Docente } from 'src/modules/principales/docentes/entities/docente.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Estudiante, Docente]),
    AuthModule
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule { }
