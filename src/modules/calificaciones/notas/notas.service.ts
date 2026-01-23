import { Injectable } from '@nestjs/common';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Nota } from './entities/nota.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotasService {
	constructor(
		@InjectRepository(Nota)
		private readonly notaRepository: Repository<Nota>,
	) {}
    async create(createNotaDto: CreateNotaDto): Promise<Nota> {
		const item = this.notaRepository.create(createNotaDto);
		return await this.notaRepository.save(item);
    }
    async findAll(): Promise<Nota[]> {
		return await this.notaRepository.find({
			relations:['estudiante','grupo','evaluacion'],
		});
	}
    async findOne(id: number): Promise<Nota | null> {
		return await this.notaRepository.findOne({
			where: { id },
			relations: ['estudiante','grupo','evaluacion'],
		});
	}
    async update(id: number, updateNotaDto: UpdateNotaDto): Promise<Nota | null> {
		const existe = await this.notaRepository.findOne({
			where: { id },
		});
		if (!existe) {
			return null;
		}
		await this.notaRepository.update(id, updateNotaDto);
		return await this.findOne(id);
    }
    async remove(id: number): Promise<void | { message: string }> {
		const nota = await this.findOne(id);
		if (!nota) {
			throw new Error('Nota no encontrada');
		}
		await this.notaRepository.remove(nota);
		return { message: 'Nota eliminada' };
	}
}
