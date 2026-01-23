import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEncuestaPreguntaDto } from './dto/create-encuesta_pregunta.dto';
import { UpdateEncuestaPreguntaDto } from './dto/update-encuesta_pregunta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EncuestaPregunta } from './entities/encuesta_pregunta.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EncuestaPreguntasService {
  constructor(
    @InjectRepository(EncuestaPregunta)
    private readonly encuestaPreguntaRepository: Repository<EncuestaPregunta>,
  ) { }

  async create(createEncuestaPreguntaDto: CreateEncuestaPreguntaDto) {
    const nuevaPregunta = this.encuestaPreguntaRepository.create(createEncuestaPreguntaDto);
    return await this.encuestaPreguntaRepository.save(nuevaPregunta);
  }

  async findAll() {
    return await this.encuestaPreguntaRepository.find({
      order: { orden: 'ASC' }
    });
  }

  async findOne(id: number) {
    const pregunta = await this.encuestaPreguntaRepository.findOneBy({ id });
    if (!pregunta) {
      throw new NotFoundException(`Pregunta con ID ${id} no encontrada`);
    }
    return pregunta;
  }

  async update(id: number, updateEncuestaPreguntaDto: UpdateEncuestaPreguntaDto) {
    const pregunta = await this.findOne(id);
    this.encuestaPreguntaRepository.merge(pregunta, updateEncuestaPreguntaDto);
    return await this.encuestaPreguntaRepository.save(pregunta);
  }

  async remove(id: number) {
    const pregunta = await this.findOne(id);
    return await this.encuestaPreguntaRepository.remove(pregunta);
  }
}

