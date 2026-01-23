import { Injectable } from '@nestjs/common';
import { CreateEvaluacioneDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacioneDto } from './dto/update-evaluacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Evaluacion } from './entities/evaluacion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EvaluacionesService {
	constructor(
		@InjectRepository(Evaluacion)
		private readonly evaluacionRepository: Repository<Evaluacion>,
	) {}
	async create(createEvaluacioneDto: CreateEvaluacioneDto): Promise<Evaluacion> {
		const item = this.evaluacionRepository.create(createEvaluacioneDto);
		return await this.evaluacionRepository.save(item);
	}
	async findAll() : Promise<Evaluacion[]> {
		return await this.evaluacionRepository.find({
			relations:['modulo']
		});
	}
	async findOne(id: number) : Promise<Evaluacion | null> {
		return await this.evaluacionRepository.findOne({
			where: { id },
			relations: ['modulo'],
		});
	}
	async update(id: number, updateEvaluacioneDto: UpdateEvaluacioneDto) : Promise<Evaluacion | null> {
		const existe = await this.evaluacionRepository.findOne({
			where: { id },
		});
		if (!existe) {
			return null;
		}
		await this.evaluacionRepository.update(id, updateEvaluacioneDto);
		return await this.findOne(id)
	}
	async remove(id: number) : Promise<void | { message: string }> {
		const evaluacion = await this.findOne(id);
		if (!evaluacion) {
			throw new Error('Evaluación no encontrada');
		}
		await this.evaluacionRepository.remove(evaluacion);
		return { message: 'Evaluación eliminada' };
	}
}
