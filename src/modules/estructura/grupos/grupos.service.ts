import { Injectable } from '@nestjs/common';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Grupo } from './entities/grupo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GruposService {
	constructor(
		@InjectRepository(Grupo)
		private readonly grupoRepository: Repository<Grupo>,
	) { }

	async create(createGrupoDto: CreateGrupoDto): Promise<Grupo> {
		const item = this.grupoRepository.create(createGrupoDto);
		return await this.grupoRepository.save(item);
	}

	async findAll(): Promise<Grupo[]> {
		return await this.grupoRepository.find({
			relations: ['modulo', 'ciclo', 'docente', 'aula'],
		});
	}

	async findOne(id: number): Promise<Grupo | null> {
		return await this.grupoRepository.findOne({
			where: { id },
			relations: ['modulo', 'ciclo', 'docente', 'aula'],
		});
	}

	async update(id: number, updateGrupoDto: UpdateGrupoDto): Promise<Grupo | null> {
		const existe = await this.grupoRepository.findOne({
			where: { id },
		});
		if (!existe) {
			return null;
		}
		await this.grupoRepository.update(id, updateGrupoDto);
		return this.findOne(id);
	}

	async remove(id: number): Promise<{ message: string }> {
		const grupo = await this.findOne(id);
		if (!grupo) {
			throw new Error('Grupo no encontrado');
		}
		await this.grupoRepository.remove(grupo);
		return { message: 'Grupo eliminado' };
	}
}
