import { Injectable } from '@nestjs/common';
import { CreateExamenesubicacionDto } from './dto/create-examenesubicacion.dto';
import { UpdateExamenesubicacionDto } from './dto/update-examenesubicacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Examenesubicacion } from './entities/examenesubicacion.entity';

@Injectable()
export class ExamenesubicacionService {
	constructor(
		@InjectRepository(Examenesubicacion)
		private examenesubicacionRepository: Repository<Examenesubicacion>,
	) {}
	
	async create(createExamenesubicacionDto: CreateExamenesubicacionDto) : Promise<Examenesubicacion> {
		const item = this.examenesubicacionRepository.create(createExamenesubicacionDto);
		return await this.examenesubicacionRepository.save(item);
	}

	async findAll() : Promise<Examenesubicacion[]> {
		return await this.examenesubicacionRepository.find({
			relations: ['estado', 'idioma', 'docente', 'aula'],
		});
	}

	async findOne(id: number) : Promise<Examenesubicacion | null> {
		return await this.examenesubicacionRepository.findOne({
			where: { id },
			relations: ['estado', 'idioma', 'docente', 'aula'],
		});
	}

	async update(id: number, updateExamenesubicacionDto: UpdateExamenesubicacionDto) : Promise<Examenesubicacion | null> {
		const item = await this.findOne(id)
		if (!item) {
			return null;
		}
		await this.examenesubicacionRepository.update(id, updateExamenesubicacionDto);
		return await this.findOne(id);
	}

	async remove(id: number) : Promise<Examenesubicacion | null> {
		const item = await this.findOne(id);
		if (!item) {
			return null;
		}
		await this.examenesubicacionRepository.delete(id);
		return item;
	}
}
