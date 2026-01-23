import { Injectable } from '@nestjs/common';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Estado, EstadoReferencia } from './entities/estado.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EstadosService {
	constructor(
		@InjectRepository(Estado)
		private readonly estadoRepository: Repository<Estado>,
	) {}
	async create(createEstadoDto: CreateEstadoDto): Promise<Estado>{
		const item = this.estadoRepository.create(createEstadoDto);
		return await this.estadoRepository.save(item);
	}

	async findAll(): Promise<Estado[]> {
		return await this.estadoRepository.find({
			order: {
				id: 'ASC',
			},
		});
	}

	async findByReferencia(referencia: EstadoReferencia): Promise<Estado[]> {
		return await this.estadoRepository.find({
			where: {
				referencia,
			},
			order: {
				id: 'ASC',
			},
		});
	}

	async findOne(id: number): Promise<Estado | null> {
		return await this.estadoRepository.findOne({
			where: {
				id,
			},
		});
	}

	async update(id: number, updateEstadoDto: UpdateEstadoDto): Promise<Estado | null> {
		const item = await this.findOne(id);
		if (!item) {
			return null;
		}
		await this.estadoRepository.update(id, updateEstadoDto);
		return await this.findOne(id);
	}
	async remove(id: number): Promise<boolean> {
		const item = await this.findOne(id);
		if (!item) {
			return false;
		}
		await this.estadoRepository.delete(id);
		return true;
	}
}
