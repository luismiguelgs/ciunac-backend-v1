import { Injectable } from '@nestjs/common';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';
import { Repository } from 'typeorm';
import { Aula } from './entities/aula.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AulasService {
	constructor(
		@InjectRepository(Aula)
		private readonly aulaRepository: Repository<Aula>
	) {}

	async create(createAulaDto: CreateAulaDto): Promise<Aula> {
		const item = this.aulaRepository.create(createAulaDto)
		return await this.aulaRepository.save(item);
	}

	async findAll(): Promise<Aula[]> {
		return await this.aulaRepository.find();
	}

	async findOne(id: number): Promise<Aula | null> {
		return await this.aulaRepository.findOne({where: {id}});
	}

	async update(id: number, updateAulaDto: UpdateAulaDto): Promise<Aula | null> {
		const existe = await this.aulaRepository.findOne({where: {id}});
		if (!existe) {
			return null;
		}
		await this.aulaRepository.update(id, updateAulaDto);
		return await this.findOne(id)
	}

	async remove(id: number) : Promise<{ message: string }> {
		const item = await this.findOne(id);
		if (!item) {
			throw new Error('Estudiante no encontrado');
		}
		await this.aulaRepository.remove(item);
		return { message: 'Aula eliminada' };
	}
}
