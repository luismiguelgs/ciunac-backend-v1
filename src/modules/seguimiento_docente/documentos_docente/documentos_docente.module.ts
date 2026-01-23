import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosDocente } from './entities/documentos_docente.entity';
import { DocumentosDocenteService } from './documentos_docente.service';
import { DocumentosDocenteController } from './documentos_docente.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentosDocente])],
  controllers: [DocumentosDocenteController],
  providers: [DocumentosDocenteService],
})
export class DocumentosDocenteModule { }
