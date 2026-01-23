import { Injectable } from '@nestjs/common';
import { CreateEscuelaDto } from './dto/create-escuela.dto';
import { UpdateEscuelaDto } from './dto/update-escuela.dto';
import { Escuela } from './entities/escuela.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EscuelasService {
	constructor(
		@InjectRepository(Escuela)
		private readonly escuelaRepository: Repository<Escuela>,
	) {}
	async create(createEscuelaDto: CreateEscuelaDto) {
		return await this.escuelaRepository.save(createEscuelaDto);
	}
	async findAll() {
		return await this.escuelaRepository.find({
			relations: ['facultad'],
		});
	}
	async findOne(id: number) {
		return await this.escuelaRepository.findOne({
			where: {
				id,
			},
			relations: ['facultad'],
		});
	}

	async update(id: number, updateEscuelaDto: UpdateEscuelaDto) {
		const existe = await this.escuelaRepository.findOne({
			where: { id },
		});
		if (!existe) {
			return null;
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
