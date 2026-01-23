import { Module } from '@nestjs/common';
import { TipoDocumentoPerfilService } from './tipo_documento_perfil.service';
import { TipoDocumentoPerfilController } from './tipo_documento_perfil.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoDocumentoPerfil } from './entities/tipo_documento_perfil.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoDocumentoPerfil])],
  controllers: [TipoDocumentoPerfilController],
  providers: [TipoDocumentoPerfilService],
})
export class TipoDocumentoPerfilModule {}
