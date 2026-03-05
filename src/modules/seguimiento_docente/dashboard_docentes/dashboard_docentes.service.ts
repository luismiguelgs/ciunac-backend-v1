import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModulosService } from '../../estructura/modulos/modulos.service';
import { EncuestaRespuesta } from '../encuesta_respuestas/entities/encuesta_respuesta.entity';
import { Docente } from '../../principales/docentes/entities/docente.entity';
import { PerfilDocenteResultado } from '../perfil_docente_resultados/entities/perfil_docente_resultado.entity';
import { DocumentosDocente } from '../documentos_docente/entities/documentos_docente.entity';
import { PerfilDocente } from '../perfil_docente/entities/perfil_docente.entity';
import { CumplimientoDocente } from '../cumplimiento_docente/entities/cumplimiento_docente.entity';
import { EncuestaRespuestasDetalle } from '../encuesta_respuestas_detalle/entities/encuesta_respuestas_detalle.entity';

@Injectable()
export class DashboardDocentesService {
	constructor(
		@InjectRepository(PerfilDocenteResultado)
		private readonly perfilDocenteResultadoRepository: Repository<PerfilDocenteResultado>,
		@InjectRepository(EncuestaRespuesta)
		private readonly encuestaRespuestaRepository: Repository<EncuestaRespuesta>,
		@InjectRepository(Docente)
		private readonly docenteRepository: Repository<Docente>,
		@InjectRepository(DocumentosDocente)
		private readonly documentosDocenteRepository: Repository<DocumentosDocente>,
		@InjectRepository(PerfilDocente)
		private readonly perfilDocenteRepository: Repository<PerfilDocente>,
		@InjectRepository(CumplimientoDocente)
		private readonly cumplimientoDocenteRepository: Repository<CumplimientoDocente>,
		@InjectRepository(EncuestaRespuestasDetalle)
		private readonly encuestaDetalleRepository: Repository<EncuestaRespuestasDetalle>,
		private readonly modulosService: ModulosService,
	) { }

	async getMetricasGlobales(): Promise<{ moduloId: number; promedio: number; docentesEvaluados: number; encuestasRealizadas: number; encuestasPeriodoAnterior: number; docentesActivos: number }> {
		const moduloActivo = await this.modulosService.findActive();
		if (!moduloActivo) {
			throw new NotFoundException('No existe un módulo activo');
		}

		const docentesActivos = await this.docenteRepository.count({
			where: { activo: true },
		});

		const encuestasRealizadas = await this.encuestaRespuestaRepository.count({
			where: { periodo: moduloActivo.nombre },
		});

		const [anioStr, mesStr] = String(moduloActivo.nombre).split('-');
		const anio = Number(anioStr);
		const mes = Number(mesStr);

		let periodoAnterior: string | null = null;
		if (!Number.isNaN(anio) && !Number.isNaN(mes) && mes >= 1 && mes <= 12) {
			const prevMes = mes === 1 ? 12 : mes - 1;
			const prevAnio = mes === 1 ? anio - 1 : anio;
			periodoAnterior = `${prevAnio}-${String(prevMes).padStart(2, '0')}`;
		}

		const encuestasPeriodoAnterior = periodoAnterior
			? await this.encuestaRespuestaRepository.count({ where: { periodo: periodoAnterior } })
			: 0;

		const result = await this.perfilDocenteResultadoRepository
			.createQueryBuilder('pdr')
			.select('AVG(pdr.resultado_final)', 'promedio')
			.addSelect('COUNT(DISTINCT pdr.docente_id)', 'docentesEvaluados')
			.where('pdr.modulo_id = :moduloId', { moduloId: moduloActivo.id })
			.getRawOne<{ promedio: string | null; docentesEvaluados: string | null }>();

		return {
			moduloId: moduloActivo.id,
			promedio: Number(result?.promedio ?? 0),
			docentesEvaluados: Number(result?.docentesEvaluados ?? 0),
			encuestasRealizadas,
			encuestasPeriodoAnterior,
			docentesActivos,
		};
	}

	async getDesempeñoGeneral(): Promise<{ moduloId: number; promedioGeneral: number; excelente: number; bueno: number; regular: number; deficiente: number; totalEvaluados: number }> {
		const moduloActivo = await this.modulosService.findActive();
		if (!moduloActivo) {
			throw new NotFoundException('No existe un módulo activo');
		}

		const rows = await this.perfilDocenteResultadoRepository
			.createQueryBuilder('pdr')
			.select('AVG(pdr.resultado_final)', 'promedioGeneral')
			.addSelect(
				"SUM(CASE WHEN pdr.resultado_final >= 81 THEN 1 ELSE 0 END)",
				'excelente',
			)
			.addSelect(
				"SUM(CASE WHEN pdr.resultado_final < 81 AND pdr.resultado_final >= 74 THEN 1 ELSE 0 END)",
				'bueno',
			)
			.addSelect(
				"SUM(CASE WHEN pdr.resultado_final < 74 AND pdr.resultado_final >= 64 THEN 1 ELSE 0 END)",
				'regular',
			)
			.addSelect(
				"SUM(CASE WHEN pdr.resultado_final < 64 THEN 1 ELSE 0 END)",
				'deficiente',
			)
			.addSelect('COUNT(*)', 'totalEvaluados')
			.where('pdr.modulo_id = :moduloId', { moduloId: moduloActivo.id })
			.getRawOne<{
				promedioGeneral: string | null;
				excelente: string | null;
				bueno: string | null;
				regular: string | null;
				deficiente: string | null;
				totalEvaluados: string | null;
			}>();

		return {
			moduloId: moduloActivo.id,
			promedioGeneral: Number(rows?.promedioGeneral ?? 0),
			excelente: Number(rows?.excelente ?? 0),
			bueno: Number(rows?.bueno ?? 0),
			regular: Number(rows?.regular ?? 0),
			deficiente: Number(rows?.deficiente ?? 0),
			totalEvaluados: Number(rows?.totalEvaluados ?? 0),
		};
	}

	async getRankingDocentes(): Promise<PerfilDocenteResultado[]> {
		const moduloActivo = await this.modulosService.findActive();
		if (!moduloActivo) {
			throw new NotFoundException('No existe un módulo activo');
		}

		const top3 = await this.perfilDocenteResultadoRepository.find({
			where: { moduloId: moduloActivo.id },
			relations: ['docente', 'perfilDocente', 'modulo'],
			order: { resultadoFinal: 'DESC' },
			take: 3,
		});

		const bottom2 = await this.perfilDocenteResultadoRepository.find({
			where: { moduloId: moduloActivo.id },
			relations: ['docente', 'perfilDocente', 'modulo'],
			order: { resultadoFinal: 'ASC' },
			take: 2,
		});

		const byId = new Map<number, PerfilDocenteResultado>();
		for (const r of top3) byId.set(r.id, r);
		for (const r of bottom2) byId.set(r.id, r);

		return Array.from(byId.values()).sort((a, b) => Number(b.resultadoFinal) - Number(a.resultadoFinal));
	}

	async getPerfilProfesional(): Promise<{ licenciatura: number; maestria: number; doctorado: number; b2: number; c1: number; c2: number; promedioHorasCapacitacion: number }> {
		const docCounts = await this.documentosDocenteRepository
			.createQueryBuilder('dd')
			.select(
				'SUM(CASE WHEN dd.tipo_documento_perfil_id = 1 THEN 1 ELSE 0 END)',
				'licenciatura',
			)
			.addSelect(
				'SUM(CASE WHEN dd.tipo_documento_perfil_id = 2 THEN 1 ELSE 0 END)',
				'maestria',
			)
			.addSelect(
				'SUM(CASE WHEN dd.tipo_documento_perfil_id = 3 THEN 1 ELSE 0 END)',
				'doctorado',
			)
			.addSelect('AVG(dd.horas_capacitacion)', 'promedioHorasCapacitacion')
			.getRawOne<{ licenciatura: string | null; maestria: string | null; doctorado: string | null; promedioHorasCapacitacion: string | null }>();

		const levelCounts = await this.perfilDocenteRepository
			.createQueryBuilder('pd')
			.select("SUM(CASE WHEN pd.nivel_idioma = 'B2' THEN 1 ELSE 0 END)", 'b2')
			.addSelect("SUM(CASE WHEN pd.nivel_idioma = 'C1' THEN 1 ELSE 0 END)", 'c1')
			.addSelect("SUM(CASE WHEN pd.nivel_idioma = 'C2' THEN 1 ELSE 0 END)", 'c2')
			.getRawOne<{ b2: string | null; c1: string | null; c2: string | null }>();

		return {
			licenciatura: Number(docCounts?.licenciatura ?? 0),
			maestria: Number(docCounts?.maestria ?? 0),
			doctorado: Number(docCounts?.doctorado ?? 0),
			b2: Number(levelCounts?.b2 ?? 0),
			c1: Number(levelCounts?.c1 ?? 0),
			c2: Number(levelCounts?.c2 ?? 0),
			promedioHorasCapacitacion: Number(docCounts?.promedioHorasCapacitacion ?? 0),
		};
	}

	async getCumplimiento(): Promise<{ promedioPuntaje: number }> {
		const moduloActivo = await this.modulosService.findActive();
		if (!moduloActivo) {
			throw new NotFoundException('No existe un módulo activo');
		}

		const result = await this.cumplimientoDocenteRepository
			.createQueryBuilder('cd')
			.select('AVG(cd.puntaje)', 'promedioPuntaje')
			.where('cd.modulo_id = :moduloId', { moduloId: moduloActivo.id })
			.andWhere('cd.academico_administrativo_id IN (:...ids)', { ids: [1, 2, 3] })
			.getRawOne<{ promedioPuntaje: string | null }>();

		return {
			promedioPuntaje: Number(result?.promedioPuntaje ?? 0),
		};
	}

	async getGestionMetodologica(): Promise<{ promedioPuntaje: number }> {
		const moduloActivo = await this.modulosService.findActive();
		if (!moduloActivo) {
			throw new NotFoundException('No existe un módulo activo');
		}

		const result = await this.cumplimientoDocenteRepository
			.createQueryBuilder('cd')
			.select('AVG(cd.puntaje)', 'promedioPuntaje')
			.where('cd.modulo_id = :moduloId', { moduloId: moduloActivo.id })
			.andWhere('cd.academico_administrativo_id = :id', { id: 4 })
			.getRawOne<{ promedioPuntaje: string | null }>();

		return {
			promedioPuntaje: Number(result?.promedioPuntaje ?? 0),
		};
	}

	async getValoracionEstudiantil(): Promise<{ dimension: string; promedio: number }[]> {
		const moduloActivo = await this.modulosService.findActive();
		if (!moduloActivo) {
			throw new NotFoundException('No existe un módulo activo');
		}

		const results = await this.encuestaDetalleRepository
			.createQueryBuilder('erd')
			.innerJoin('erd.respuesta', 'er')
			.innerJoin('erd.pregunta', 'ep')
			.select('ep.dimension', 'dimension')
			.addSelect('AVG(erd.valor_numero)', 'promedio')
			.where('er.periodo = :periodo', { periodo: moduloActivo.nombre })
			.groupBy('ep.dimension')
			.getRawMany<{ dimension: string; promedio: string }>();

		return results.map(r => ({
			dimension: r.dimension,
			promedio: Number(r.promedio ?? 0),
		}));
	}
}
