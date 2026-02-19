import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosDocente } from './entities/documentos_docente.entity';
import { DocumentosDocenteService } from './documentos_docente.service';
import { DocumentosDocenteController } from './documentos_docente.controller';
import { PerfilDocenteModule } from '../perfil_docente/perfil_docente.module';
import { TipoDocumentoPerfil } from '../tipo_documento_perfil/entities/tipo_documento_perfil.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentosDocente, TipoDocumentoPerfil]), PerfilDocenteModule],
  controllers: [DocumentosDocenteController],
  providers: [DocumentosDocenteService],
})
export class DocumentosDocenteModule { }
