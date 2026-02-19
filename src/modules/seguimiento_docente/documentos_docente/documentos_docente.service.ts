import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentosDocenteDto } from './dto/create-documentos_docente.dto';
import { UpdateDocumentosDocenteDto } from './dto/update-documentos_docente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentosDocente } from './entities/documentos_docente.entity';
import { PerfilDocenteService } from '../perfil_docente/perfil_docente.service';
import { TipoDocumentoPerfil } from '../tipo_documento_perfil/entities/tipo_documento_perfil.entity';

@Injectable()
export class DocumentosDocenteService {
	constructor(
		@InjectRepository(DocumentosDocente)
		private readonly documentosDocenteRepository: Repository<DocumentosDocente>,

			@InjectRepository(TipoDocumentoPerfil)
			private readonly tipoDocumentoPerfilRepository: Repository<TipoDocumentoPerfil>,

			private readonly perfilDocenteService: PerfilDocenteService,
	) { }

	private async getEffectivePuntaje(tipoDocumentoPerfilId: number, puntaje?: number) {
		if (puntaje !== undefined && puntaje !== null) {
			return Number(puntaje);
		}
		const tipo = await this.tipoDocumentoPerfilRepository.findOne({
			where: { id: tipoDocumentoPerfilId },
		});
		return tipo ? Number(tipo.puntaje) : 0;
	}

	async create(createDocumentosDocenteDto: CreateDocumentosDocenteDto) {
		const newDocumento = this.documentosDocenteRepository.create(createDocumentosDocenteDto);
			const savedDocumento = await this.documentosDocenteRepository.save(newDocumento);

			let puntajeDelta = Number(createDocumentosDocenteDto.puntaje ?? 0);
			if (!createDocumentosDocenteDto.puntaje) {
				const tipo = await this.tipoDocumentoPerfilRepository.findOne({
					where: { id: createDocumentosDocenteDto.tipoDocumentoPerfilId },
				});
				puntajeDelta = tipo ? Number(tipo.puntaje) : 0;
			}

			const experienciaDelta = Number(createDocumentosDocenteDto.experienciaLaboral ?? 0);
			await this.perfilDocenteService.aplicarDocumento(
				createDocumentosDocenteDto.perfilDocenteId,
				puntajeDelta,
				experienciaDelta,
			);

			return savedDocumento;
	}

	async findAll() {
		return await this.documentosDocenteRepository.find({
		relations: ['perfilDocente', 'tipoDocumentoPerfil', 'estado'],
		});
	}

	async findByPerfilDocenteId(perfilDocenteId: string) {
		return await this.documentosDocenteRepository.find({
		where: { perfilDocenteId },
		relations: ['perfilDocente', 'tipoDocumentoPerfil', 'estado'],
		});
	}

	async findOne(id: number) {
		const documento = await this.documentosDocenteRepository.findOne({
		where: { id },
		relations: ['perfilDocente', 'tipoDocumentoPerfil', 'estado'],
		});

		if (!documento) {
		throw new NotFoundException(`DocumentoDocente with ID #${id} not found`);
		}

		return documento;
	}

	async update(id: number, updateDocumentosDocenteDto: UpdateDocumentosDocenteDto) {
		const documentoAnterior = await this.documentosDocenteRepository.findOne({
			where: { id },
		});
		if (!documentoAnterior) {
			throw new NotFoundException(`DocumentoDocente with ID #${id} not found`);
		}

		const documento = await this.documentosDocenteRepository.preload({
			id,
			...updateDocumentosDocenteDto,
		});
		if (!documento) {
			throw new NotFoundException(`DocumentoDocente with ID #${id} not found`);
		}

		documento.perfilDocenteId = documentoAnterior.perfilDocenteId;

		const savedDocumento = await this.documentosDocenteRepository.save(documento);

		const puntajeAnterior = await this.getEffectivePuntaje(documentoAnterior.tipoDocumentoPerfilId, documentoAnterior.puntaje);
		const puntajeNuevo = await this.getEffectivePuntaje(savedDocumento.tipoDocumentoPerfilId, savedDocumento.puntaje);
		const experienciaAnterior = Number(documentoAnterior.experienciaLaboral ?? 0);
		const experienciaNueva = Number(savedDocumento.experienciaLaboral ?? 0);

		await this.perfilDocenteService.aplicarDocumento(
			documentoAnterior.perfilDocenteId,
			-puntajeAnterior + puntajeNuevo,
			-experienciaAnterior + experienciaNueva,
		);

		return savedDocumento;
	}

	async remove(id: number) {
		const documento = await this.findOne(id);
		const puntaje = await this.getEffectivePuntaje(documento.tipoDocumentoPerfilId, documento.puntaje);
		const experiencia = Number(documento.experienciaLaboral ?? 0);
		await this.perfilDocenteService.aplicarDocumento(
			documento.perfilDocenteId,
			-puntaje,
			-experiencia,
		);
		return await this.documentosDocenteRepository.remove(documento);
	}
}
