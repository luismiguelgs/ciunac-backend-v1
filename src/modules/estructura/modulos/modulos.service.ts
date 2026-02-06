import { Injectable } from '@nestjs/common';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Modulo } from './entities/modulo.entity';

@Injectable()
export class ModulosService {
	constructor(
		@InjectRepository(Modulo)
		private readonly repo: Repository<Modulo>,
	) { }

	create(createModuloDto: CreateModuloDto) {
		const nuevo = this.repo.create(createModuloDto);
		return this.repo.save(nuevo);
	}

	findAll() {
		return this.repo.find({
			order: {
				orden: 'DESC',
			},
		});
	}

	findAllVisibles() {
		return this.repo.find({
			where: {
				visible: true,
			},
			order: {
				orden: 'ASC',
			},
		});
	}

	findOne(id: number) {
		return this.repo.findOne({
			where: {
				id,
			},
		});
	}

	async update(id: number, updateModuloDto: UpdateModuloDto) {
		const existe = await this.repo.findOne({
			where: { id },
		});
		if (!existe) {
			return null;
		}
		await this.repo.update(id, updateModuloDto);
		return this.findOne(id);
	}

	remove(id: number) {
		return this.repo.delete(id);
	}

	async findByName(nombre: string): Promise<Modulo | null> {
		return await this.repo.findOne({
			where: { nombre },
		});
	}
}
