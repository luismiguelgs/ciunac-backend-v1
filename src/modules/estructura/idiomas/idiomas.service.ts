import { Injectable } from '@nestjs/common';
import { CreateIdiomaDto } from './dto/create-idioma.dto';
import { UpdateIdiomaDto } from './dto/update-idioma.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Idioma } from './entities/idioma.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IdiomasService {
    constructor(
        @InjectRepository(Idioma)
        private readonly idiomaRepository: Repository<Idioma>
    ) {}
    async create(createIdiomaDto: CreateIdiomaDto) : Promise<Idioma> {
		const idioma = this.idiomaRepository.create(createIdiomaDto);
      	return await this.idiomaRepository.save(idioma);
    }

    async findAll() : Promise<Idioma[]> {
      	return await this.idiomaRepository.find({
			order: {
				nombre: 'ASC'
			}
      	});
    }

    async findOne(id: number) : Promise<Idioma | null> {
		return await this.idiomaRepository.findOne({
			where: {
				id
			}
      	});
    }

    async update(id: number, updateIdiomaDto: UpdateIdiomaDto) : Promise<Idioma | null> {
		const existe = await this.idiomaRepository.findOne({
			where: { id },
		});
		if (!existe) {
			return null;
		}
		await this.idiomaRepository.update(id, updateIdiomaDto);
		return this.findOne(id);
    }

    async remove(id: number) : Promise<{ message: string }> {
		const idioma = await this.findOne(id);
		if (!idioma) {
			throw new Error('Idioma no encontrado');
		}
		await this.idiomaRepository.remove(idioma);
		return { message: 'Idioma eliminado' };
    }
}
