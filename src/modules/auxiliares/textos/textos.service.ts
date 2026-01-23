import { Injectable } from '@nestjs/common';
import { CreateTextoDto } from './dto/create-texto.dto';
import { UpdateTextoDto } from './dto/update-texto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Texto } from './schemas/texto.schema';

@Injectable()
export class TextosService {
	constructor(@InjectModel(Texto.name) private textoModel: Model<Texto>) {}

	async create(createTextoDto: CreateTextoDto) : Promise<Texto> {
    	return await this.textoModel.create(createTextoDto);
	}

	async findAll() : Promise<Texto[]> {
		return await this.textoModel.find().exec();
	}

	async findOne(id: string) : Promise<Texto | null> {
		return await this.textoModel.findById(id).exec();
	}

	async update(id: string, updateTextoDto: UpdateTextoDto): Promise<Texto | null> {
    	return await this.textoModel.findByIdAndUpdate(id, updateTextoDto).exec();
  	}

	async remove(id: string): Promise<Texto | null> {
    	return await this.textoModel.findByIdAndDelete(id).exec();
  	}
}
