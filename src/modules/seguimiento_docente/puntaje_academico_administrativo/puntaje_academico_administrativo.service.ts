import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePuntajeAcademicoAdministrativoDto } from './dto/create-puntaje_academico_administrativo.dto';
import { UpdatePuntajeAcademicoAdministrativoDto } from './dto/update-puntaje_academico_administrativo.dto';
import { PuntajeAcademicoAdministrativo } from './entities/puntaje_academico_administrativo.entity';

@Injectable()
export class PuntajeAcademicoAdministrativoService {
  constructor(
    @InjectRepository(PuntajeAcademicoAdministrativo)
    private readonly puntajeRepository: Repository<PuntajeAcademicoAdministrativo>,
  ) { }

  async create(createPuntajeAcademicoAdministrativoDto: CreatePuntajeAcademicoAdministrativoDto) {
    const puntaje = this.puntajeRepository.create(createPuntajeAcademicoAdministrativoDto);
    return await this.puntajeRepository.save(puntaje);
  }

  async findAll() {
    return await this.puntajeRepository.find({
      relations: ['academicoAdministrativo'],
    });
  }

  async findOne(id: number) {
    const puntaje = await this.puntajeRepository.findOne({
      where: { id },
      relations: ['academicoAdministrativo'],
    });
    if (!puntaje) {
      throw new NotFoundException(`Puntaje Academico Administrativo with ID ${id} not found`);
    }
    return puntaje;
  }

  async update(id: number, updatePuntajeAcademicoAdministrativoDto: UpdatePuntajeAcademicoAdministrativoDto) {
    const puntaje = await this.findOne(id);
    const { academicoAdministrativoId, ...rest } = updatePuntajeAcademicoAdministrativoDto;

    const updateData: any = { ...rest };
    if (academicoAdministrativoId) {
      updateData.academicoAdministrativoId = academicoAdministrativoId;
    }

    Object.assign(puntaje, updateData);
    return await this.puntajeRepository.save(puntaje);
  }

  async remove(id: number) {
    const puntaje = await this.findOne(id);
    return await this.puntajeRepository.remove(puntaje);
  }
}
