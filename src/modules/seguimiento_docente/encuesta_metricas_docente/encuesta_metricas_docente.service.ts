import { Injectable } from '@nestjs/common';
import { CreateEncuestaMetricasDocenteDto } from './dto/create-encuesta_metricas_docente.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncuestaMetricasDocente } from './entities/encuesta_metricas_docente.entity';

@Injectable()
export class EncuestaMetricasDocenteService {
	constructor(
		@InjectRepository(EncuestaMetricasDocente)
		private readonly repository: Repository<EncuestaMetricasDocente>,
	) { }

	async create(createEncuestaMetricasDocenteDto: CreateEncuestaMetricasDocenteDto) {
		const newVal = this.repository.create(createEncuestaMetricasDocenteDto);
		return await this.repository.save(newVal);
	}

	async findAll() {
		return await this.repository.find({
			relations: ['docente', 'modulo'],
		});
	}

	async findByPeriodo(moduloId: number) {
		return await this.repository.find({
			where: { moduloId },
			relations: ['docente', 'modulo'],
			order: { promedioGeneral: 'DESC' }
		});
	}

	async findOne(id: number) {
		return await this.repository.findOne({
			where: { id },
			relations: ['docente', 'modulo'],
		});
	}
}
