import { Injectable } from '@nestjs/common';
import { CreateTipossolicitudDto } from './dto/create-tipossolicitud.dto';
import { UpdateTipossolicitudDto } from './dto/update-tipossolicitud.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tipossolicitud } from './entities/tipossolicitud.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TipossolicitudService {
	constructor(
		@InjectRepository(Tipossolicitud)
		private readonly tipossolicitudRepository: Repository<Tipossolicitud>,
	) {}
	async create(createTipossolicitudDto: CreateTipossolicitudDto): Promise<Tipossolicitud> {
		const item = this.tipossolicitudRepository.create(createTipossolicitudDto);
		return await this.tipossolicitudRepository.save(item);
	}
	async findAll(): Promise<Tipossolicitud[]> {
		return await this.tipossolicitudRepository.find({
			order: {
				id: 'ASC',
			},
		});
	}
	async findOne(id: number): Promise<Tipossolicitud | null> {
		return await this.tipossolicitudRepository.findOne({
			where: { id },
		});
	}

	async update(id: number, updateTipossolicitudDto: UpdateTipossolicitudDto): Promise<Tipossolicitud | null> {
		const existe = await this.tipossolicitudRepository.findOne({
			where: { id },
		});
		if (!existe) {
			return null;
		}
		await this.tipossolicitudRepository.update(id, updateTipossolicitudDto);
		return await this.findOne(id);
	}

	async remove(id: number): Promise<void | { message: string }> {
		const tipossolicitud = await this.findOne(id);
		if (!tipossolicitud) {
			throw new Error('Tipo de solicitud no encontrada');
		}
		await this.tipossolicitudRepository.remove(tipossolicitud);
		return { message: 'Tipo de solicitud eliminada' };
	}
}
