import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCumplimientoDocenteDto } from './dto/create-cumplimiento_docente.dto';
import { UpdateCumplimientoDocenteDto } from './dto/update-cumplimiento_docente.dto';
import { CumplimientoDocente } from './entities/cumplimiento_docente.entity';

@Injectable()
export class CumplimientoDocenteService {
  constructor(
    @InjectRepository(CumplimientoDocente)
    private readonly cumplimientoRepository: Repository<CumplimientoDocente>,
  ) { }

  async create(createCumplimientoDocenteDto: CreateCumplimientoDocenteDto) {
    const cumplimiento = this.cumplimientoRepository.create({
      ...createCumplimientoDocenteDto,
    });
    return await this.cumplimientoRepository.save(cumplimiento);
  }

  async findAll() {
    return await this.cumplimientoRepository.find({
      relations: ['modulo', 'docente', 'academicoAdministrativo'],
    });
  }

  async findOne(id: number) {
    const cumplimiento = await this.cumplimientoRepository.findOne({
      where: { id },
      relations: ['modulo', 'docente', 'academicoAdministrativo'],
    });
    if (!cumplimiento) {
      throw new NotFoundException(`Cumplimiento Docente with ID ${id} not found`);
    }
    return cumplimiento;
  }

  async update(id: number, updateCumplimientoDocenteDto: UpdateCumplimientoDocenteDto) {
    const cumplimiento = await this.findOne(id);
    const { moduloId, docenteId, academicoAdministrativoId, ...rest } = updateCumplimientoDocenteDto;

    const updateData: any = { ...rest };
    if (moduloId) updateData.moduloId = moduloId;
    if (docenteId) updateData.docenteId = docenteId;
    if (academicoAdministrativoId) updateData.academicoAdministrativoId = academicoAdministrativoId;

    Object.assign(cumplimiento, updateData);
    return await this.cumplimientoRepository.save(cumplimiento);
  }

  async remove(id: number) {
    const cumplimiento = await this.findOne(id);
    return await this.cumplimientoRepository.remove(cumplimiento);
  }
}
