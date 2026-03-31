import { Injectable } from '@nestjs/common';
import { CreateSolicitudbecaDto } from './dto/create-solicitudbeca.dto';
import { UpdateSolicitudbecaDto } from './dto/update-solicitudbeca.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EstadoSolicitud, SolicitudBeca, SolicitudBecaDocument } from './schemas/solicitudbeca.schema';

@Injectable()
export class SolicitudbecasService {
	constructor(
		@InjectModel(SolicitudBeca.name) 
		private solicitudBecaModel: Model<SolicitudBecaDocument>
	) {}

	// Función auxiliar para normalizar el ID
	private mapId(doc: any) {
		if (!doc) return null;
		
		// Si el documento es un array (para findAll)
		if (Array.isArray(doc)) {
			return doc.map(item => this.mapId(item));
		}

		// Convertamos _id a string (funciona con el String de Firebase y el ObjectId de Mongo)
		const idString = doc._id ? doc._id.toString() : null;
		
		return {
			...doc,
			_id: idString,
			id: idString,
		};
	}

	async create(createSolicitudbecaDto: CreateSolicitudbecaDto) : Promise<SolicitudBeca>{
		const createdSolicitudBeca = new this.solicitudBecaModel(createSolicitudbecaDto);
		
		if (!createdSolicitudBeca._id) {
			createdSolicitudBeca._id = new Types.ObjectId(); 
		}

		const doc = await createdSolicitudBeca.save();
		return this.mapId(doc.toObject());
	}

	async findAll() : Promise<SolicitudBeca[]> {
		const solicitudes = await this.solicitudBecaModel.find().lean().exec();
		return solicitudes.map(sol => this.mapId(sol));
	}

	async findByEstado(estado: EstadoSolicitud) : Promise<SolicitudBeca[]> {
		const solicitudes = await this.solicitudBecaModel
			.find({ estado })
			.sort({ creado_en: -1 })
			.lean()
			.exec();
		return solicitudes.map(sol => this.mapId(sol));
	}

	async findOne(id: string) : Promise<SolicitudBeca | null> {
		const criterios: any = []
		criterios.push({ _id: id })
		
		if (Types.ObjectId.isValid(id)) {
			criterios.push({ _id: new Types.ObjectId(id) })
		}

		const solicitud = await this.solicitudBecaModel
			.findOne({ $or: criterios })
			.lean()
			.exec();

		if (!solicitud) return null;

		return this.mapId(solicitud);
	}

	async update(id: string, updateSolicitudbecaDto: UpdateSolicitudbecaDto) : Promise<SolicitudBeca | null> {
		const query = {
			$or: [
				{ _id: id },
				...(Types.ObjectId.isValid(id) ? [{ _id: new Types.ObjectId(id) }] : [])
			]
		};

		const updated = await this.solicitudBecaModel
			.findOneAndUpdate(query, updateSolicitudbecaDto, { new: true })
			.lean()
			.exec();

		if (!updated) return null;
			
		return this.mapId(updated);
	}

	async remove(id: string) : Promise<SolicitudBeca | null> {
		const query = {
			$or: [
				{ _id: id },
				...(Types.ObjectId.isValid(id) ? [{ _id: new Types.ObjectId(id) }] : [])
			]
		};

		const deleted = await this.solicitudBecaModel
			.findOneAndDelete(query)
			.lean()
			.exec();

		return this.mapId(deleted);
	}
}
