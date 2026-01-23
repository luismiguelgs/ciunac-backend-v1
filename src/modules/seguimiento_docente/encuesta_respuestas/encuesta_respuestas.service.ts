import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEncuestaRespuestaDto } from './dto/create-encuesta_respuesta.dto';
import { UpdateEncuestaRespuestaDto } from './dto/update-encuesta_respuesta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EncuestaRespuesta } from './entities/encuesta_respuesta.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EncuestaRespuestasService {
  constructor(
    @InjectRepository(EncuestaRespuesta)
    private readonly encuestaRespuestaRepository: Repository<EncuestaRespuesta>,
  ) { }

  async create(createEncuestaRespuestaDto: CreateEncuestaRespuestaDto) {
    const nuevaRespuesta = this.encuestaRespuestaRepository.create(createEncuestaRespuestaDto);
    return await this.encuestaRespuestaRepository.save(nuevaRespuesta);
  }

  async findAll() {
    return await this.encuestaRespuestaRepository.find({
      relations: ['grupo'],
      order: { creadoEn: 'DESC' }
    });
  }

  async findOne(id: number) {
    const respuesta = await this.encuestaRespuestaRepository.findOne({
      where: { id },
      relations: ['grupo']
    });
    if (!respuesta) {
      throw new NotFoundException(`Respuesta con ID ${id} no encontrada`);
    }
    return respuesta;
  }

  async update(id: number, updateEncuestaRespuestaDto: UpdateEncuestaRespuestaDto) {
    const respuesta = await this.findOne(id);
    this.encuestaRespuestaRepository.merge(respuesta, updateEncuestaRespuestaDto);
    return await this.encuestaRespuestaRepository.save(respuesta);
  }

  async remove(id: number) {
    const respuesta = await this.findOne(id);
    return await this.encuestaRespuestaRepository.remove(respuesta);
  }
}

