import { Module } from '@nestjs/common';
import { EstudiantesService } from './estudiantes.service';
import { EstudiantesController } from './estudiantes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { Usuario } from 'src/modules/usuarios/usuarios/entities/usuario.entity';
import { Facultad } from 'src/modules/auxiliares/facultades/entities/facultad.entity';
import { Escuela } from 'src/modules/auxiliares/escuelas/entities/escuela.entity';

@Module({
	imports: [TypeOrmModule.forFeature([
		Estudiante,
		Usuario,
		Facultad,
		Escuela
	])],
	controllers: [EstudiantesController],
	providers: [EstudiantesService],
	exports: [EstudiantesService]
})
export class EstudiantesModule { }
