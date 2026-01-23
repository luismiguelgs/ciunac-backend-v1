import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTipoDocumentoPerfilDto } from './dto/create-tipo_documento_perfil.dto';
import { UpdateTipoDocumentoPerfilDto } from './dto/update-tipo_documento_perfil.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoDocumentoPerfil } from './entities/tipo_documento_perfil.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TipoDocumentoPerfilService {
  constructor(
    @InjectRepository(TipoDocumentoPerfil)
    private readonly tipoDocumentoPerfilRepository: Repository<TipoDocumentoPerfil>,
  ) {}

  async create(createTipoDocumentoPerfilDto: CreateTipoDocumentoPerfilDto) {
    const newTipoDocumentoPerfil = this.tipoDocumentoPerfilRepository.create(createTipoDocumentoPerfilDto);
    return await this.tipoDocumentoPerfilRepository.save(newTipoDocumentoPerfil);
  }

  async findAll() {
    return await this.tipoDocumentoPerfilRepository.find();
  }

  async findOne(id: number) {
    const tipoDocumentoPerfil = await this.tipoDocumentoPerfilRepository.findOne({ where: { id } });
    if (!tipoDocumentoPerfil) {
      throw new NotFoundException(`TipoDocumentoPerfil with ID #${id} not found`);
    }
    return tipoDocumentoPerfil;
  }

  async update(id: number, updateTipoDocumentoPerfilDto: UpdateTipoDocumentoPerfilDto) {
    const tipoDocumentoPerfil = await this.tipoDocumentoPerfilRepository.preload({
      id: id,
      ...updateTipoDocumentoPerfilDto,
    });
    if (!tipoDocumentoPerfil) {
      throw new NotFoundException(`TipoDocumentoPerfil with ID #${id} not found`);
    }
    return this.tipoDocumentoPerfilRepository.save(tipoDocumentoPerfil);
  }

  async remove(id: number) {
    const tipoDocumentoPerfil = await this.findOne(id);
    return await this.tipoDocumentoPerfilRepository.remove(tipoDocumentoPerfil);
  }
}
