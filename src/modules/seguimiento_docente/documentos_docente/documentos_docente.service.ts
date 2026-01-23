import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentosDocenteDto } from './dto/create-documentos_docente.dto';
import { UpdateDocumentosDocenteDto } from './dto/update-documentos_docente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentosDocente } from './entities/documentos_docente.entity';

@Injectable()
export class DocumentosDocenteService {
  constructor(
    @InjectRepository(DocumentosDocente)
    private readonly documentosDocenteRepository: Repository<DocumentosDocente>,
  ) { }

  async create(createDocumentosDocenteDto: CreateDocumentosDocenteDto) {
    const newDocumento = this.documentosDocenteRepository.create(createDocumentosDocenteDto);
    return await this.documentosDocenteRepository.save(newDocumento);
  }

  async findAll() {
    return await this.documentosDocenteRepository.find({
      relations: ['perfilDocente', 'tipoDocumentoPerfil', 'estado'],
    });
  }

  async findOne(id: number) {
    const documento = await this.documentosDocenteRepository.findOne({
      where: { id },
      relations: ['perfilDocente', 'tipoDocumentoPerfil', 'estado'],
    });

    if (!documento) {
      throw new NotFoundException(`DocumentoDocente with ID #${id} not found`);
    }

    return documento;
  }

  async update(id: number, updateDocumentosDocenteDto: UpdateDocumentosDocenteDto) {
    const documento = await this.documentosDocenteRepository.preload({
      id,
      ...updateDocumentosDocenteDto,
    });

    if (!documento) {
      throw new NotFoundException(`DocumentoDocente with ID #${id} not found`);
    }

    return await this.documentosDocenteRepository.save(documento);
  }

  async remove(id: number) {
    const documento = await this.findOne(id);
    return await this.documentosDocenteRepository.remove(documento);
  }
}
