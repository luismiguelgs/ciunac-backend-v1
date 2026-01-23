import { Injectable } from '@nestjs/common';
import { CreateNotasfinalDto } from './dto/create-notasfinal.dto';
import { UpdateNotasfinalDto } from './dto/update-notasfinal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Notasfinal } from './entities/notasfinal.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotasfinalService {
	constructor(
		@InjectRepository(Notasfinal)
		private notasfinalRepository: Repository<Notasfinal>,
	) {}
	async create(createNotasfinalDto: CreateNotasfinalDto) : Promise<Notasfinal> {
		const item = this.notasfinalRepository.create(createNotasfinalDto);
		return await this.notasfinalRepository.save(item);
	}
	async findAll() : Promise<Notasfinal[]> {
		return await this.notasfinalRepository.find({
			relations:['estudiante','grupo'],
		});
	}
	async findOne(id: number) : Promise<Notasfinal | null> {
		return await this.notasfinalRepository.findOne({
			where:{
				id,
			},
			relations:['estudiante','grupo'],
		});
	}
	async update(id: number, updateNotasfinalDto: UpdateNotasfinalDto) : Promise<Notasfinal | null> {
		const existe = await this.notasfinalRepository.findOne({
			where: { id },
		});
		if (!existe) {
			return null;
		}
		await this.notasfinalRepository.update(id, updateNotasfinalDto);
		return await this.findOne(id);
	}
	async remove(id: number) : Promise<void | { message: string }> {
		const nota = await this.findOne(id);
		if (!nota) {
			throw new Error('Nota no encontrada');
		}
		await this.notasfinalRepository.remove(nota);
		return { message: 'Nota eliminada' };
	}
}
