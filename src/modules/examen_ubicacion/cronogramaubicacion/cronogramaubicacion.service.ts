import { Injectable } from '@nestjs/common';
import { CreateCronogramaubicacionDto } from './dto/create-cronogramaubicacion.dto';
import { UpdateCronogramaubicacionDto } from './dto/update-cronogramaubicacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cronogramaubicacion } from './entities/cronogramaubicacion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CronogramaubicacionService {
	constructor(
		@InjectRepository(Cronogramaubicacion)
		private readonly cronogramaubicacionRepository: Repository<Cronogramaubicacion>,
	) {}
	async create(createCronogramaubicacionDto: CreateCronogramaubicacionDto): Promise<Cronogramaubicacion> {
		const cronogramaubicacion = this.cronogramaubicacionRepository.create(createCronogramaubicacionDto);
		return this.cronogramaubicacionRepository.save(cronogramaubicacion);
	}

	async findAll() : Promise<Cronogramaubicacion[]> {
		return await this.cronogramaubicacionRepository.find({
			relations: ['modulo'],
		});
	}

	async findOne(id: number) : Promise<Cronogramaubicacion | null> {
		return await this.cronogramaubicacionRepository.findOne({
			where: { id },
			relations: ['modulo'],
		});
	}

	async update(id: number, updateCronogramaubicacionDto: UpdateCronogramaubicacionDto): Promise<Cronogramaubicacion | null> {
		const cronogramaubicacion = await this.findOne(id);
		if (!cronogramaubicacion) {
			return null;
		}
		await this.cronogramaubicacionRepository.update(id, updateCronogramaubicacionDto);
		return this.findOne(id);
	}

	async remove(id: number): Promise<Cronogramaubicacion | null> {
		const cronogramaubicacion = await this.findOne(id);
		if (!cronogramaubicacion) {
			return null;
		}
		await this.cronogramaubicacionRepository.delete(id);
		return cronogramaubicacion;
	}
}
