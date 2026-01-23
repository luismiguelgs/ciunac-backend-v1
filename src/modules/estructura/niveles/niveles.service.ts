import { Injectable } from '@nestjs/common';
import { CreateNivelDto } from './dto/create-nivel.dto';
import { UpdateNivelDto } from './dto/update-nivel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Nivel } from './entities/nivel.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NivelesService {
	constructor(
		@InjectRepository(Nivel)
		private readonly nivelRepository: Repository<Nivel>
	) {}

	async create(createNiveleDto: CreateNivelDto) {
		const item = this.nivelRepository.create(createNiveleDto)
		return await this.nivelRepository.save(item);
	}

	async findAll() : Promise<Nivel[]> {
		return await this.nivelRepository.find({
			order: {
				orden: 'ASC'
			}
		});
	}

	async findOne(id: number): Promise<Nivel | null> {
		return await this.nivelRepository.findOne({where: {id}});
	}

	async update(id: number, updateNivelDto: UpdateNivelDto) {
		const existe = await this.nivelRepository.findOne({
			where: { id },
		});
		if (!existe) {
			return null;
		}
		await this.nivelRepository.update(id, updateNivelDto);
		return await this.findOne(id);
	}

	async remove(id: number) : Promise<{ message: string }> {
		const item = await this.findOne(id);
		if (!item) {
			throw new Error('Nivel no encontrado');
		}
		await this.nivelRepository.remove(item);
		return { message: 'Nivel eliminado' };
	}
}
