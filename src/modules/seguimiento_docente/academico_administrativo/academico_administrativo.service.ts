import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAcademicoAdministrativoDto } from './dto/create-academico_administrativo.dto';
import { UpdateAcademicoAdministrativoDto } from './dto/update-academico_administrativo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicoAdministrativo } from './entities/academico_administrativo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AcademicoAdministrativoService {
  constructor(
    @InjectRepository(AcademicoAdministrativo)
    private readonly academicoRepo: Repository<AcademicoAdministrativo>,
  ) { }

  async create(createDto: CreateAcademicoAdministrativoDto) {
    const nuevo = this.academicoRepo.create(createDto);
    return await this.academicoRepo.save(nuevo);
  }

  async findAll() {
    return await this.academicoRepo.find();
  }

  async findOne(id: number) {
    const item = await this.academicoRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`AcademicoAdministrativo with ID ${id} not found`);
    return item;
  }

  async update(id: number, updateDto: UpdateAcademicoAdministrativoDto) {
    const item = await this.academicoRepo.preload({ id, ...updateDto });
    if (!item) throw new NotFoundException(`AcademicoAdministrativo with ID ${id} not found`);
    return await this.academicoRepo.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    return await this.academicoRepo.remove(item);
  }
}
