import { Injectable } from '@nestjs/common';
import { CreateDetallesubicacionDto } from './dto/create-detallesubicacion.dto';
import { UpdateDetallesubicacionDto } from './dto/update-detallesubicacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Detallesubicacion } from './entities/detallesubicacion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DetallesubicacionService {
	constructor(
		@InjectRepository(Detallesubicacion)
		private readonly detallesubicacionRepository: Repository<Detallesubicacion>,
	) {}

	async create(createDetallesubicacionDto: CreateDetallesubicacionDto) : Promise<Detallesubicacion> {
		const detallesubicacion = this.detallesubicacionRepository.create(createDetallesubicacionDto);
		return this.detallesubicacionRepository.save(detallesubicacion);
	}

	async findAll() : Promise<Detallesubicacion[]> {
		return this.detallesubicacionRepository.find({
			where: { activo: true },
			relations: ['nivel', 'examen', 'estudiante', 'calificacion', 'idioma'],
		});
	}

	async findByExamen(examenId: number) : Promise<Detallesubicacion[]> {
		return this.detallesubicacionRepository.find({
			where: { 
				examen: {id: examenId}, 
				activo: true 
			},
			relations: ['nivel', 'examen', 'estudiante', 'calificacion', 'idioma'],
			order: {
				estudiante: {
					apellidos: 'ASC',
				},
			},
		});
	}

	async findOne(id: number) : Promise<Detallesubicacion | null> {
		return this.detallesubicacionRepository.findOne({
			where: { id },
			relations: ['nivel', 'examen', 'estudiante', 'calificacion', 'idioma'],
		});
	}

	async findByDocumentNumber(numeroDocumento: string) : Promise<Detallesubicacion[]> {
		return this.detallesubicacionRepository.find({
			where: { 
				estudiante: {
					numeroDocumento,
				},
				activo: true,
			},
			relations: ['nivel', 'examen', 'estudiante', 'calificacion', 'idioma'],
		});
	}

	async update(id: number, updateDetallesubicacionDto: UpdateDetallesubicacionDto) : Promise<Detallesubicacion | null> {
		const existe = await this.detallesubicacionRepository.findOne({
			where: { id },
		});
		if (!existe) {
			return null;
		}
		await this.detallesubicacionRepository.update(id, updateDetallesubicacionDto);
		return this.findOne(id);
	}

	async remove(id: number) : Promise<boolean> {
		const detallesubicacion = await this.findOne(id);
		if (!detallesubicacion) {
			return false;
		}
		await this.detallesubicacionRepository.update(id, { activo: false });
		return true;
	}
}
