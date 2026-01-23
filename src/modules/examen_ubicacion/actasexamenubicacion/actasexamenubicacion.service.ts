import { Injectable } from '@nestjs/common';
import { CreateActasexamenubicacionDto } from './dto/create-actasexamenubicacion.dto';
import { UpdateActasexamenubicacionDto } from './dto/update-actasexamenubicacion.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActaExamenUbicacion, ActaExamenUbicacionDocument } from './schemas/actasexamenubicacion.schema';

@Injectable()
export class ActasexamenubicacionService {
	constructor(
		@InjectModel(ActaExamenUbicacion.name) 
		private actasExamenUbicacionModel: Model<ActaExamenUbicacionDocument>
	) {}

	async create(createActasexamenubicacionDto: CreateActasexamenubicacionDto) : Promise<ActaExamenUbicacion> {
		const createdActaExamenUbicacion = new this.actasExamenUbicacionModel(createActasexamenubicacionDto);
		return createdActaExamenUbicacion.save();
	}

	async findAll() : Promise<ActaExamenUbicacion[]> {
		return this.actasExamenUbicacionModel.find().exec();
	}

	async findOne(id: string) : Promise<ActaExamenUbicacion | null> {
		return this.actasExamenUbicacionModel.findById(id).exec();
	}

	async update(id: string, updateActasexamenubicacionDto: UpdateActasexamenubicacionDto) : Promise<ActaExamenUbicacion | null> {
		return this.actasExamenUbicacionModel.findByIdAndUpdate(id, updateActasexamenubicacionDto, { new: true });
	}

	async remove(id: string) : Promise<ActaExamenUbicacion | null> {
		return this.actasExamenUbicacionModel.findByIdAndDelete(id);
	}
}
