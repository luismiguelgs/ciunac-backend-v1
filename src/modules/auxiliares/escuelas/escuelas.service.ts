import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEscuelaDto } from './dto/create-escuela.dto';
import { UpdateEscuelaDto } from './dto/update-escuela.dto';
import { Escuela } from './entities/escuela.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from 'src/modules/principales/estudiantes/entities/estudiante.entity';

@Injectable()
export class EscuelasService {
  constructor(
    @InjectRepository(Escuela)
    private readonly escuelaRepository: Repository<Escuela>,
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
  ) {}
  async create(createEscuelaDto: CreateEscuelaDto): Promise<Escuela> {
    return await this.escuelaRepository.save(createEscuelaDto);
  }
  async findAll(): Promise<Escuela[]> {
    return await this.escuelaRepository.find({
      relations: ['facultad'],
    });
  }
  async findOne(id: number): Promise<Escuela | null> {
    return await this.escuelaRepository.findOne({
      where: {
        id,
      },
      relations: ['facultad'],
    });
  }

  async update(
    id: number,
    updateEscuelaDto: UpdateEscuelaDto,
  ): Promise<Escuela | null> {
    const existe = await this.escuelaRepository.findOne({
      where: { id },
    });
    if (!existe) {
      return null;
    }
    if (
      updateEscuelaDto.tipo !== undefined &&
      updateEscuelaDto.tipo !== existe.tipo
    ) {
      const incompatible = await this.estudianteRepository.existsBy({
        escuelaId: id,
        tipoEstudiante: updateEscuelaDto.tipo === 'PRE' ? 'POS' : 'PRE',
      });
      if (incompatible) {
        throw new BadRequestException(
          'No se puede cambiar el tipo de la escuela porque tiene estudiantes de un tipo incompatible',
        );
      }
    }
    await this.escuelaRepository.update(id, updateEscuelaDto);
    return await this.escuelaRepository.findOne({
      where: {
        id,
      },
      relations: ['facultad'],
    });
  }
  async remove(id: number) {
    return await this.escuelaRepository.delete(id);
  }
}
