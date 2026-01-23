import { Injectable } from '@nestjs/common';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Certificado, CertificadoDocument } from './schemas/certificado.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class CertificadosService {
	constructor(
		@InjectModel(Certificado.name) 
		private certificadoModel: Model<CertificadoDocument>
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

	async create(createCertificadoDto: CreateCertificadoDto) : Promise<Certificado> {
		const created = new this.certificadoModel(createCertificadoDto);
		// 2. Si es un documento nuevo y no trae ID, generamos un ObjectId de Mongo
		if (!created._id) {
		created._id = new Types.ObjectId(); 
		}
		const doc = await created.save();
		return this.mapId(doc.toObject());
	}

	async findAll() : Promise<Certificado[]> {
		const certificados = await this.certificadoModel.find().lean().exec();
    	return certificados.map(cert => this.mapId(cert));
	}

	async findBySolicitudId(solicitudId: number) : Promise<Certificado | null> {
	  const certificado = await this.certificadoModel
		.findOne({ solicitudId })
		.lean()
		.exec();

  // 2. Usamos la función de mapeo para asegurar que _id e id existan como string
  return this.mapId(certificado);
	}

	async findByImpreso(impreso: boolean) : Promise<Certificado[]> {
		const certificados = await this.certificadoModel
			.find({ impreso })
			.sort({ fechaEmision: -1 })
			.lean()
			.exec();
		return certificados.map(cert => this.mapId(cert));
	}

	async findOne(id: string) : Promise<Certificado | null> {
		const criterios:any = []
		criterios.push({ _id: id})
		
		if(Types.ObjectId.isValid(id)){
			criterios.push({ _id: new Types.ObjectId(id) })
		}

		const certificado = await this.certificadoModel
			.findOne({ $or: criterios })
			.lean()
			.exec();

		if (!certificado) return null;

    	return this.mapId(certificado);
	}
	async update(id: string, updateCertificadoDto: UpdateCertificadoDto) : Promise<Certificado | null> {
		const query = {
			$or: [
				{ _id: id },
				...(Types.ObjectId.isValid(id) ? [{ _id: new Types.ObjectId(id) }] : [])
			]
		};

		const updated = await this.certificadoModel
			.findOneAndUpdate(query, updateCertificadoDto, { new: true })
			.lean()
			.exec();

		if (!updated) return null;
			
		return this.mapId(updated);
	}
	async remove(id: string) : Promise<Certificado | null> {
		const deleted = await this.certificadoModel
			.findOneAndDelete({ _id: id })
			.lean()
			.exec();
		return this.mapId(deleted);
	}
}
