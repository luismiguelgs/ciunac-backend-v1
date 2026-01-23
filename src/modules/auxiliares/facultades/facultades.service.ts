import { Injectable } from '@nestjs/common';
import { CreateFacultadeDto } from './dto/create-facultade.dto';
import { UpdateFacultadeDto } from './dto/update-facultade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Facultad } from './entities/facultad.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FacultadesService {
	constructor(
		@InjectRepository(Facultad)
		private readonly facultadRepository: Repository<Facultad>,
	){}

	create(createFacultadeDto: CreateFacultadeDto) {
		const nueva = this.facultadRepository.create(createFacultadeDto);
		return this.facultadRepository.save(nueva);
	}

	findAll() {
		return this.facultadRepository.find();
	}

	findOne(id: number) {
		return this.facultadRepository.findOne({
			where: {
				id,
			},
		});
	}

	async update(id: number, updateFacultadeDto: UpdateFacultadeDto) {
		const existe = await this.facultadRepository.findOne({
			where: { id },
		});
		if (!existe) {
			return null;
		}
		await this.facultadRepository.update(id, updateFacultadeDto);
		return this.findOne(id);
	}

	remove(id: number) {
		return this.facultadRepository.delete(id);
	}
}
