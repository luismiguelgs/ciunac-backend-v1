import { BadRequestException, Injectable, Inject, forwardRef, Logger, NotFoundException } from '@nestjs/common';
import { CreateConstanciaDto } from './dto/create-constancia.dto';
import { UpdateConstanciaDto } from './dto/update-constancia.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Constancia, ConstanciaDocument } from './schemas/constancia.schema';
import { Model, Types } from 'mongoose';
import { UploadService } from 'src/shared/upload/upload.service';
import { SolicitudesService } from '../solicitudes/solicitudes.service';

export interface ProcesarFirmaResult {
	success: true;
	fileId: string;
	name: string;
	viewLink: string;
	originalTrashed: boolean;
	warning?: string;
}

@Injectable()
export class ConstanciasService {
	private readonly logger = new Logger(ConstanciasService.name);

	constructor(
		@InjectModel(Constancia.name)
		private constanciaModel: Model<ConstanciaDocument>,
		@Inject(forwardRef(() => UploadService))
		private readonly uploadService: UploadService,
		private readonly solicitudesService: SolicitudesService,
	) { }

	// Funcion auxiliar para normalizar el ID
	private mapId(doc: any) {
		if (!doc) return null;

		if (Array.isArray(doc)) {
			return doc.map(item => this.mapId(item));
		}

		const idString = doc._id ? doc._id.toString() : null;

		return {
			...doc,
			_id: idString,
			id: idString,
		};
	}

	async create(createConstanciaDto: CreateConstanciaDto): Promise<Constancia> {
		const created = new this.constanciaModel(createConstanciaDto);
		if (!created._id) {
			created._id = new Types.ObjectId();
		}
		const doc = await created.save();
		return this.mapId(doc.toObject());
	}

	async findAll(): Promise<Constancia[]> {
		const constancias = await this.constanciaModel.find().lean().exec();
		return constancias.map(constancia => this.mapId(constancia));
	}

	async findPendientes(): Promise<Constancia[]> {
		const constancias = await this.constanciaModel
			.find({ impreso: false, aceptado: false })
			.sort({ creadoEn: -1 })
			.lean()
			.exec();
		return constancias.map(constancia => this.mapId(constancia));
	}

	async findByImpreso(): Promise<Constancia[]> {
		const constancias = await this.constanciaModel
			.find({ impreso: true, aceptado: false })
			.sort({ creadoEn: -1 })
			.lean()
			.exec();
		return constancias.map(constancia => this.mapId(constancia));
	}

	async findByAceptado(): Promise<Constancia[]> {
		const constancias = await this.constanciaModel
			.find({ impreso: true, aceptado: true })
			.sort({ creadoEn: -1 })
			.lean()
			.exec();
		return constancias.map(constancia => this.mapId(constancia));
	}

	async findOne(id: string): Promise<Constancia | null> {
		const criterios: any = []
		criterios.push({ _id: id })

		if (Types.ObjectId.isValid(id)) {
			criterios.push({ _id: new Types.ObjectId(id) })
		}

		const constancia = await this.constanciaModel
			.findOne({ $or: criterios })
			.lean()
			.exec();

		if (!constancia) return null;

		return this.mapId(constancia);
	}

	async update(id: string, updateConstanciaDto: UpdateConstanciaDto): Promise<Constancia | null> {
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

	async remove(id: string): Promise<Constancia | null> {
		const deleted = await this.constanciaModel
			.findOneAndDelete({ _id: id })
			.lean()
			.exec();
		return this.mapId(deleted);
	}

	async procesarFirma(
		constanciaId: string,
		fileId: string | undefined,
		solicitudId: number,
	): Promise<ProcesarFirmaResult> {
		const constancia = await this.findOne(constanciaId);
		if (!constancia) {
			throw new NotFoundException(`Constancia ${constanciaId} no encontrada`);
		}

		const solicitud = await this.solicitudesService.findOne(solicitudId);
		if (!solicitud) {
			throw new NotFoundException(`Solicitud ${solicitudId} no encontrada`);
		}

		const originalFileId = constancia.driveId?.trim() || this.sanitizeFileId(fileId);
		if (!originalFileId) {
			throw new BadRequestException('La constancia no tiene un driveId asociado');
		}

		const { originalFile, signedFile } = await this.uploadService.findSignedVersion(originalFileId);
		const driveResult = await this.uploadService.moveFileToRepository(signedFile.id);
		const query = {
			$or: [
				{ _id: constanciaId },
				...(Types.ObjectId.isValid(constanciaId) ? [{ _id: new Types.ObjectId(constanciaId) }] : [])
			]
		};

		const updatedConstancia = await this.constanciaModel.findOneAndUpdate(
			query,
			{
				impreso: true,
				driveId: driveResult.id,
				url: driveResult.viewLink || driveResult.downloadLink || constancia.url,
			},
			{ new: true },
		).exec();

		if (!updatedConstancia) {
			throw new NotFoundException(`Constancia ${constanciaId} no encontrada durante la actualizacion`);
		}

		const updatedSolicitud = await this.solicitudesService.update(solicitudId, { estadoId: 3 });
		if (!updatedSolicitud) {
			throw new NotFoundException(`Solicitud ${solicitudId} no encontrada durante la actualizacion`);
		}

		let originalTrashed = true;
		let warning: string | undefined;

		if (originalFile.id !== driveResult.id) {
			try {
				await this.uploadService.trashFile(originalFile.id);
			} catch (error) {
				originalTrashed = false;
				warning = 'La constancia firmada fue procesada, pero no se pudo enviar el archivo original a la papelera';
				this.logger.warn(`${warning}: ${this.getErrorMessage(error)}`);
			}
		}

		return {
			success: true,
			fileId: driveResult.id,
			name: driveResult.name,
			viewLink: driveResult.viewLink,
			originalTrashed,
			...(warning ? { warning } : {}),
		};
	}

	private sanitizeFileId(fileId?: string): string | undefined {
		if (!fileId || fileId === 'null' || fileId === 'undefined' || !fileId.trim()) {
			return undefined;
		}
		return fileId.trim();
	}

	private getErrorMessage(error: unknown): string {
		return error instanceof Error ? error.message : String(error);
	}
}
