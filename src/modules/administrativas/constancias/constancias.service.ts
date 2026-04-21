import { Injectable } from '@nestjs/common';
import { CreateConstanciaDto } from './dto/create-constancia.dto';
import { UpdateConstanciaDto } from './dto/update-constancia.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Constancia, ConstanciaDocument } from './schemas/constancia.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class ConstanciasService {
	constructor(
		@InjectModel(Constancia.name) 
		private constanciaModel: Model<ConstanciaDocument>
	) {}

	// Función auxiliar para normalizar el ID
	private mapId(doc: any) {
		if (!doc) return null;
		
		// Si el documento es un array (para findAll)
		if (Array.isArray(doc)) {
			return doc.map(item => this.mapId(item));
		}

		// Convertimos _id a string (funciona con el String de Firebase y el ObjectId de Mongo)
		const idString = doc._id ? doc._id.toString() : null;
		
		return {
			...doc,
			_id: idString,
			id: idString,
		};
	}

    async create(createConstanciaDto: CreateConstanciaDto) : Promise<Constancia> {
		const created = new this.constanciaModel(createConstanciaDto);
		// Si es un documento nuevo y no trae ID, generamos un ObjectId de Mongo
		if (!created._id) {
			created._id = new Types.ObjectId(); 
		}
		const doc = await created.save();
		return this.mapId(doc.toObject());
    }

    async findAll() : Promise<Constancia[]> {
    	const constancias = await this.constanciaModel.find().lean().exec();
		return constancias.map(constancia => this.mapId(constancia));
    }

    async findByImpreso(impreso: boolean) : Promise<Constancia[]> {
    	const constancias = await this.constanciaModel
    		.find({ impreso }) // Filtrar por impreso true o false
    		.sort({ creado_en: -1 }) // Ordenar por fecha de creación descendente
			.lean()
    		.exec();
		return constancias.map(constancia => this.mapId(constancia));
    }

    async findOne(id: string) : Promise<Constancia | null> {
		const criterios:any = []
		criterios.push({ _id: id})
		
		if(Types.ObjectId.isValid(id)){
			criterios.push({ _id: new Types.ObjectId(id) })
		}

    	const constancia = await this.constanciaModel
			.findOne({ $or: criterios })
			.lean()
			.exec();

		if (!constancia) return null;

		return this.mapId(constancia);
    }

    async update(id: string, updateConstanciaDto: UpdateConstanciaDto) : Promise<Constancia | null> {
		const query = {
			$or: [
				{ _id: id },
				...(Types.ObjectId.isValid(id) ? [{ _id: new Types.ObjectId(id) }] : [])
			]
		};

    	const updated = await this.constanciaModel
			.findOneAndUpdate(query, updateConstanciaDto, { new: true })
			.lean()
			.exec();

		if (!updated) return null;

		return this.mapId(updated);
    }

    async remove(id: string) : Promise<Constancia | null> {
    	const deleted = await this.constanciaModel
			.findOneAndDelete({ _id: id })
			.lean()
			.exec();
		return this.mapId(deleted);
    }
}
