import { Injectable } from '@nestjs/common';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Docente } from './entities/docente.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class DocentesService {
	constructor(
		@InjectRepository(Docente)
		private docenteRepository: Repository<Docente>,
	) { }

	private getDocenteRepository(manager?: EntityManager): Repository<Docente> {
		return manager ? manager.getRepository(Docente) : this.docenteRepository;
	}

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

	async findByIdentificacion(numeroDocumento: string, manager?: EntityManager): Promise<Docente | null> {
		return await this.getDocenteRepository(manager).findOne({
			where: { numeroDocumento },
			relations: ['usuario'],
		});
	}

	async findByUser(usuarioId: string): Promise<Docente | null> {
		return await this.docenteRepository.findOne({
			where: { usuario_id: usuarioId },
		});
	}

	async assignUsuario(docenteId: string, usuarioId: string, manager?: EntityManager): Promise<Docente | null> {
		const docenteRepository = this.getDocenteRepository(manager);
		await docenteRepository.update(docenteId, { usuario_id: usuarioId });
		return await docenteRepository.findOne({
			where: { id: docenteId },
			relations: ['usuario'],
		});
	}
}
