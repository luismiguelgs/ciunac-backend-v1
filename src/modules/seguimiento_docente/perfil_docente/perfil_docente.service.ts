import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePerfilDocenteDto } from './dto/create-perfil_docente.dto';
import { UpdatePerfilDocenteDto } from './dto/update-perfil_docente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PerfilDocente } from './entities/perfil_docente.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PerfilDocenteService {
	constructor(
		@InjectRepository(PerfilDocente)
		private readonly perfilDocenteRepository: Repository<PerfilDocente>,
	) { }

	async create(createPerfilDocenteDto: CreatePerfilDocenteDto) {
		const newPerfilDocente = this.perfilDocenteRepository.create(createPerfilDocenteDto);
		return await this.perfilDocenteRepository.save(newPerfilDocente);
	}

	async findAll() {
		return await this.perfilDocenteRepository.find({
			relations: ['docente', 'idioma']
		});
	}

	async findOne(id: string) {
		const perfilDocente = await this.perfilDocenteRepository.findOne({
			where: { id },
			relations: ['docente', 'idioma']
		});
		if (!perfilDocente) {
			throw new NotFoundException(`PerfilDocente with ID #${id} not found`);
		}
		return perfilDocente;
	}

	async update(id: string, updatePerfilDocenteDto: UpdatePerfilDocenteDto) {
		const perfilDocente = await this.perfilDocenteRepository.preload({
			id: id,
			...updatePerfilDocenteDto,
		});
		if (!perfilDocente) {
			throw new NotFoundException(`PerfilDocente with ID #${id} not found`);
		}
		return this.perfilDocenteRepository.save(perfilDocente);
	}

	async aplicarDocumento(perfilDocenteId: string, puntajeDelta: number, experienciaLaboralDelta: number) {
		const perfilDocente = await this.findOne(perfilDocenteId);
		perfilDocente.puntajeFinal = Number(perfilDocente.puntajeFinal) + Number(puntajeDelta || 0);
		perfilDocente.experienciaTotal = Number(perfilDocente.experienciaTotal) + Number(experienciaLaboralDelta || 0);
		return await this.perfilDocenteRepository.save(perfilDocente);
	}

	async remove(id: string) {
		const perfilDocente = await this.findOne(id);
		return await this.perfilDocenteRepository.remove(perfilDocente);
	}
}
