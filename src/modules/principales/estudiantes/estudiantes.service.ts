import { Injectable } from '@nestjs/common';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EstudiantesService {
	constructor(
		@InjectRepository(Estudiante)
    	private readonly estudianteRepository: Repository<Estudiante>,
	){}

	async create(createEstudianteDto: CreateEstudianteDto): Promise<any> {
		// 1️⃣ Guardar localmente
		const item = this.estudianteRepository.create(createEstudianteDto);
		return await this.estudianteRepository.save(item);
	}

	async findAll() : Promise<Estudiante[]> {
		return await this.estudianteRepository.find({
			relations: ['facultad', 'escuela', 'usuario'],
		});
	}

	async findOne(id: string) : Promise<Estudiante | null> {
		return await this.estudianteRepository.findOne({
			where: { id },
			relations: ['facultad', 'escuela'],
		});
	}

	async update(id: string, updateEstudianteDto: UpdateEstudianteDto) : Promise<Estudiante | null> {
		const existe = await this.estudianteRepository.findOne({
			where: { id },
		});
		if (!existe) {
			return null;
		}
		await this.estudianteRepository.update(id, updateEstudianteDto);
		return this.findOne(id);
	}

	async remove(id: string) : Promise<void | { message: string }> {
		const estudiante = await this.findOne(id);
		if (!estudiante) {
			throw new Error('Estudiante no encontrado');
		}
		await this.estudianteRepository.remove(estudiante);
		return { message: 'Estudiante eliminado' };
	}

	async findByDni(dni: string) : Promise<Estudiante | null> {
		return await this.estudianteRepository.findOne({
			where: { numeroDocumento: dni },
			relations: ['facultad', 'escuela', 'usuario'],
		});
	}
}
