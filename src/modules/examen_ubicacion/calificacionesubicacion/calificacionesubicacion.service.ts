import { Injectable } from '@nestjs/common';
import { CreateCalificacionesubicacionDto } from './dto/create-calificacionesubicacion.dto';
import { UpdateCalificacionesubicacionDto } from './dto/update-calificacionesubicacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Calificacionesubicacion } from './entities/calificacionesubicacion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CalificacionesubicacionService {
	constructor(
		@InjectRepository(Calificacionesubicacion)
		private calificacionesubicacionRepository: Repository<Calificacionesubicacion>,
	) {}
	async create(createCalificacionesubicacionDto: CreateCalificacionesubicacionDto) {
		const item = this.calificacionesubicacionRepository.create(createCalificacionesubicacionDto);
		return await this.calificacionesubicacionRepository.save(item);
	}
	async findAll() : Promise<Calificacionesubicacion[]> {
		return await this.calificacionesubicacionRepository.find({
			relations:['ciclo','idioma','nivel'],
			order: {
				id: 'ASC',
			},
		});
	}
	async findOne(id: number) : Promise<Calificacionesubicacion | null> {
		return await this.calificacionesubicacionRepository.findOne({
			where: { id },
			relations:['ciclo','idioma','nivel'],
		});
	}
	async update(id: number, updateCalificacionesubicacionDto: UpdateCalificacionesubicacionDto) : Promise<Calificacionesubicacion | null> {
		const item = await this.findOne(id);
		if (!item) {
			return null;
		}
		await this.calificacionesubicacionRepository.update(id, updateCalificacionesubicacionDto);
		return await this.findOne(id);
	}
	async remove(id: number) : Promise<Calificacionesubicacion | null> {
		const item = await this.findOne(id);
		if (!item) {
			return null;
		}
		await this.calificacionesubicacionRepository.delete(id);
		return item;
	}
}
