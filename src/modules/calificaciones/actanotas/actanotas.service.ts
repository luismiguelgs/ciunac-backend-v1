import { Injectable } from '@nestjs/common';
import { CreateActaNotaDto } from './dto/create-actanota.dto';
import { UpdateActaNotaDto } from './dto/update-actanota.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActaNota } from './schemas/actanota.schema';

@Injectable()
export class ActanotasService {
	constructor(@InjectModel('ActaNota') private readonly actaNotaModel: Model<ActaNota>) {}

	async create(createActaNotaDto: CreateActaNotaDto): Promise<ActaNota> {
		return await this.actaNotaModel.create(createActaNotaDto);
	}

	async findAll(): Promise<ActaNota[]> {
		return await this.actaNotaModel.find().exec();
	}

	async findOne(id: string): Promise<ActaNota | null> {
		return await this.actaNotaModel.findById(id).exec();
	}

	async update(id: string, updateActaNotaDto: UpdateActaNotaDto): Promise<ActaNota | null> {
		return await this.actaNotaModel.findByIdAndUpdate(id, updateActaNotaDto);
	}

	async remove(id: string): Promise<ActaNota | null> {
		return await this.actaNotaModel.findByIdAndDelete(id);
	}
}
