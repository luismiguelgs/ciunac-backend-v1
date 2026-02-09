import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePerfilDocenteResultadoDto } from './dto/create-perfil_docente_resultado.dto';
import { UpdatePerfilDocenteResultadoDto } from './dto/update-perfil_docente_resultado.dto';
import { PerfilDocenteResultado } from './entities/perfil_docente_resultado.entity';
import { EncuestaMetricasDocente } from '../encuesta_metricas_docente/entities/encuesta_metricas_docente.entity';
import { CumplimientoDocente } from '../cumplimiento_docente/entities/cumplimiento_docente.entity';
import { PerfilDocente } from '../perfil_docente/entities/perfil_docente.entity';

@Injectable()
export class PerfilDocenteResultadosService {
	constructor(
		@InjectRepository(PerfilDocenteResultado)
		private readonly perfilDocenteResultadoRepository: Repository<PerfilDocenteResultado>,
		@InjectRepository(EncuestaMetricasDocente)
		private readonly encuestaMetricasDocenteRepository: Repository<EncuestaMetricasDocente>,
		@InjectRepository(CumplimientoDocente)
		private readonly cumplimientoDocenteRepository: Repository<CumplimientoDocente>,
		@InjectRepository(PerfilDocente)
		private readonly perfilDocenteRepository: Repository<PerfilDocente>,
	) { }

	async create(createPerfilDocenteResultadoDto: CreatePerfilDocenteResultadoDto): Promise<PerfilDocenteResultado> {
		const newRecord = this.perfilDocenteResultadoRepository.create(createPerfilDocenteResultadoDto);
		return await this.perfilDocenteResultadoRepository.save(newRecord);
	}

	async findAll(): Promise<PerfilDocenteResultado[]> {
		return await this.perfilDocenteResultadoRepository.find({
			relations: ['perfilDocente', 'modulo', 'docente'],
		});
	}

	async findOne(id: number): Promise<PerfilDocenteResultado> {
		const record = await this.perfilDocenteResultadoRepository.findOne({
			where: { id },
			relations: ['perfilDocente', 'modulo', 'docente'],
		});
		if (!record) {
			throw new NotFoundException(`PerfilDocenteResultado with id ${id} not found`);
		}
		return record;
	}

	async update(id: number, updatePerfilDocenteResultadoDto: UpdatePerfilDocenteResultadoDto): Promise<PerfilDocenteResultado> {
		const record = await this.findOne(id);
		this.perfilDocenteResultadoRepository.merge(record, updatePerfilDocenteResultadoDto);
		return await this.perfilDocenteResultadoRepository.save(record);
	}

	async generarResultado(moduloId: number, docenteId: string): Promise<PerfilDocenteResultado> {
		// 1. Obtener métricas de encuesta (Peso 0.30)
		const encuesta = await this.encuestaMetricasDocenteRepository.findOne({
			where: { moduloId, docenteId }
		});
		const puntajeEncuesta = encuesta ? Number(encuesta.promedioGeneral) * 0.30 : 0;

		// 2. Obtener registros de cumplimiento y calcular puntaje ponderado
		const cumplimientos = await this.cumplimientoDocenteRepository.find({
			where: { moduloId, docenteId },
			relations: ['academicoAdministrativo']
		});

		let puntajeCumplimientoTotal = 0;
		cumplimientos.forEach(c => {
			if (c.academicoAdministrativo && c.academicoAdministrativo.peso) {
				puntajeCumplimientoTotal += (Number(c.puntaje) * Number(c.academicoAdministrativo.peso));
			}
		});

		/********************************************************************************************** */
		//Calcular el resultado del perfil que tiene un peso de 0.30
		const puntajeCurriculum = 100 * 0.30;
		///*********************************************************************************************** */

		const resultadoFinal = Number(puntajeEncuesta) + Number(puntajeCumplimientoTotal) + Number(puntajeCurriculum);

		// 3. Obtener el PerfilDocente asociado
		const perfilDocente = await this.perfilDocenteRepository.findOne({
			where: { docenteId }
		});

		if (!perfilDocente) {
			throw new NotFoundException(`Perfil Docente para el docente ${docenteId} no encontrado`);
		}

		// 4. Crear o actualizar PerfilDocenteResultado
		let record = await this.perfilDocenteResultadoRepository.findOne({
			where: { moduloId, docenteId }
		});

		if (record) {
			record.resultadoFinal = Number(resultadoFinal);
			record.perfilDocenteId = perfilDocente.id; // perfilDocente.id es string según cambios recientes?
		} else {
			record = this.perfilDocenteResultadoRepository.create({
				moduloId,
				docenteId,
				perfilDocenteId: perfilDocente.id,
				resultadoFinal
			});
		}

		// Nota: Si perfilDocente.id es string, puede que necesitemos manejarlo. 
		// En la entidad PerfilDocenteResultado, perfilDocenteId es number.
		// En PerfilDocente entity, el usuario cambió id a string recientemente.

		return await this.perfilDocenteResultadoRepository.save(record);
	}
}
