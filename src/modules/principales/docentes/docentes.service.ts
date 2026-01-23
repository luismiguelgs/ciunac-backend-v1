import { Injectable } from '@nestjs/common';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Docente } from './entities/docente.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DocentesService {
	constructor(
		@InjectRepository(Docente)
		private docenteRepository: Repository<Docente>,
	) { }

	async create(createDocenteDto: CreateDocenteDto): Promise<Docente> {
		const item = this.docenteRepository.create(createDocenteDto);
		return await this.docenteRepository.save(item);
	}

	async findAll(): Promise<Docente[]> {
		return await this.docenteRepository.find({
			relations: ['usuario']
		});
	}
	async findActive(): Promise<Docente[]> {
		return await this.docenteRepository.find({
			where: {
				activo: true,
			},
			relations: ['usuario']
		});
	}

	async findOne(id: string): Promise<Docente | null> {
		return await this.docenteRepository.findOne({
			where: { id },
			relations: ['usuario']
		});
	}
	async update(id: string, updateDocenteDto: UpdateDocenteDto): Promise<Docente | null> {
		const existe = await this.docenteRepository.findOne({
			where: { id },
		});
		if (!existe) {
			return null;
		}
		await this.docenteRepository.update(id, updateDocenteDto);
		return this.findOne(id);
	}

	async remove(id: string): Promise<void | { message: string }> {
		const docente = await this.findOne(id);
		if (!docente) {
			throw new Error('Docente no encontrado');
		}
		await this.docenteRepository.update(id, { activo: false });
		return { message: 'Docente desactivado (eliminación lógica) exitosamente' };
	}

	async findByIdentificacion(numeroDocumento: string): Promise<Docente | null> {
		return await this.docenteRepository.findOne({
			where: { numeroDocumento },
			relations: ['usuario']
		});
	}
}
