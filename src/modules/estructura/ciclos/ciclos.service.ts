import { Injectable } from '@nestjs/common';
import { CreateCicloDto } from './dto/create-ciclo.dto';
import { UpdateCicloDto } from './dto/update-ciclo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ciclo } from './entities/ciclo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CiclosService {
	constructor(
		@InjectRepository(Ciclo)
		private readonly cicloRepository: Repository<Ciclo>,
	) { }

	async create(createCicloDto: CreateCicloDto) {
		const item = this.cicloRepository.create(createCicloDto);
		return await this.cicloRepository.save(item);
	}

	async findAll(): Promise<Ciclo[]> {
		return await this.cicloRepository.find({
			relations: ['idioma', 'nivel'],
		});
	}

	async findOne(id: number): Promise<Ciclo | null> {
		return await this.cicloRepository.findOne({
			where: { id },
			relations: ['idioma', 'nivel'],
		});
	}

	async update(id: number, updateCicloDto: UpdateCicloDto): Promise<Ciclo | null> {
		const existe = await this.cicloRepository.findOne({
			where: { id },
		});
		if (!existe) {
			return null;
		}
		await this.cicloRepository.update(id, updateCicloDto);
		return await this.findOne(id);
	}

	async remove(id: number): Promise<void | { message: string }> {
		const ciclo = await this.findOne(id);
		if (!ciclo) {
			throw new Error('Ciclo no encontrado');
		}
		await this.cicloRepository.remove(ciclo);
		return { message: 'Ciclo eliminado' };
	}

	async findByCode(codigo: string): Promise<Ciclo | null> {
		return await this.cicloRepository.findOne({
			where: { codigo },
			relations: ['idioma', 'nivel'],
		});
	}
}
