import { Injectable } from '@nestjs/common';
import { CreateConstanciaDto } from './dto/create-constancia.dto';
import { UpdateConstanciaDto } from './dto/update-constancia.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Constancia, ConstanciaDocument } from './schemas/constancia.schema';
import { Model } from 'mongoose';

@Injectable()
export class ConstanciasService {
	constructor(
		@InjectModel(Constancia.name) 
		private constanciaModel: Model<ConstanciaDocument>
	) {}
    async create(createConstanciaDto: CreateConstanciaDto) : Promise<Constancia> {
    	const constancia = await this.constanciaModel.create(createConstanciaDto);
    	return constancia;
    }

    async findAll() : Promise<Constancia[]> {
    	return this.constanciaModel.find().exec();
    }

    async findByImpreso(impreso: boolean) : Promise<Constancia[]> {
    	return this.constanciaModel
    		.find({ impreso }) // Filtrar por impreso true o false
    		.sort({ creado_en: -1 }) // Ordenar por fecha de creación descendente
    		.exec();
    }

    async findOne(id: string) : Promise<Constancia | null> {
    	return this.constanciaModel.findById(id).exec();
    }

    async update(id: string, updateConstanciaDto: UpdateConstanciaDto) : Promise<Constancia | null> {
    	return this.constanciaModel.findByIdAndUpdate(id, updateConstanciaDto, { new: true });
    }

    async remove(id: string) : Promise<Constancia | null> {
    	return this.constanciaModel.findByIdAndDelete(id);		
    }
}
