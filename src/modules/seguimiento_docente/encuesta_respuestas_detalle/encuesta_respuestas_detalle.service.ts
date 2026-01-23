import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEncuestaRespuestasDetalleDto } from './dto/create-encuesta_respuestas_detalle.dto';
import { UpdateEncuestaRespuestasDetalleDto } from './dto/update-encuesta_respuestas_detalle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EncuestaRespuestasDetalle } from './entities/encuesta_respuestas_detalle.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EncuestaRespuestasDetalleService {
  constructor(
    @InjectRepository(EncuestaRespuestasDetalle)
    private readonly detailRepository: Repository<EncuestaRespuestasDetalle>,
  ) { }

  async create(createEncuestaRespuestasDetalleDto: CreateEncuestaRespuestasDetalleDto) {
    const detail = this.detailRepository.create(createEncuestaRespuestasDetalleDto);
    return await this.detailRepository.save(detail);
  }

  async findAll() {
    return await this.detailRepository.find({
      relations: ['encuesta', 'pregunta'],
    });
  }

  async findOne(id: number) {
    const detail = await this.detailRepository.findOne({
      where: { id },
      relations: ['encuesta', 'pregunta'],
    });
    if (!detail) {
      throw new NotFoundException(`Detalle de respuesta con ID ${id} no encontrado`);
    }
    return detail;
  }

  async update(id: number, updateEncuestaRespuestasDetalleDto: UpdateEncuestaRespuestasDetalleDto) {
    const detail = await this.findOne(id);
    this.detailRepository.merge(detail, updateEncuestaRespuestasDetalleDto);
    return await this.detailRepository.save(detail);
  }

  async remove(id: number) {
    const detail = await this.findOne(id);
    return await this.detailRepository.remove(detail);
  }
}

