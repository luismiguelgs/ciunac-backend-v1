import { Injectable, Logger } from '@nestjs/common';
import { EncuestaRespuesta } from './entities/encuesta_respuesta.entity';
import { EncuestaRespuestasDetalle } from 'src/modules/seguimiento_docente/encuesta_respuestas_detalle/entities/encuesta_respuestas_detalle.entity';
import { DataSource } from 'typeorm';
import csv = require('csv-parser');
import { Readable } from 'stream';
import { Docente } from 'src/modules/principales/docentes/entities/docente.entity';
import { DocentesService } from 'src/modules/principales/docentes/docentes.service';
import { ModulosService } from 'src/modules/estructura/modulos/modulos.service';

const ESCALA: Record<string, number> = {
	"Excelente": 100,
	"Bueno": 75,
	"Regular": 50,
	"Deficiente": 25,
};

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EncuestaRespuestasService {

	private readonly logger = new Logger(EncuestaRespuestasService.name);

	constructor(
		@InjectRepository(EncuestaRespuesta)
		private readonly repo: Repository<EncuestaRespuesta>,
		private readonly docentesService: DocentesService,
		private readonly modulosService: ModulosService,
		private dataSource: DataSource
	) { }

	async findByDocenteAndModulo(docenteId: string, moduloId: number) {
		const modulo = await this.modulosService.findOne(moduloId);
		if (!modulo) {
			return [];
		}

		return await this.repo.find({
			where: {
				docenteId,
				periodo: modulo.nombre
			},
			relations: ['docente'],
			order: {
				fechaRegistro: 'DESC'
			}
		});
	}

	async uploadAndProcess(buffer: Buffer) {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {

			const rows = await this.parseCsv(buffer);
			this.logger.log(`Procesando ${rows.length} filas...`);

			// Caches para optimizar
			const docentesCache = new Map<string, Docente>();
			const modulosCache = new Map<string, number>();
			const periodosProcesados = new Set<string>();

			for (const row of rows) {
				const dni = row['Número Identificación'];
				const nombreDocente = row['Docente'];
				const asignatura = row['Curso'];
				const periodo = row['Período'];
				const estudiante = row['Estudiante'];
				const comentario = row['Comentario'];

				periodosProcesados.add(periodo);

				// A. GESTIÓN DEL DOCENTE
				let docente: Docente | undefined = docentesCache.get(dni);

				if (!docente) {
					docente = (await this.docentesService.findByIdentificacion(dni)) ?? undefined;
					if (!docente) {
						this.logger.warn(`Docente con DNI ${dni} no encontrado. Creando registro básico.`);
						docente = await this.docentesService.create({
							numeroDocumento: dni,
							nombres: nombreDocente,
							apellidos: '',
							genero: 'M',
							celular: '',
							fechaNacimiento: new Date(),
							tipoDocumento: 'DNI',
							activo: true,
						} as any);
					}
					docentesCache.set(dni, docente);
				}

				// B. GESTIÓN DEL MÓDULO (Lookup por nombre del periodo)
				let moduloId = modulosCache.get(periodo);
				if (!moduloId) {
					const modulo = await this.modulosService.findByName(periodo);
					if (!modulo) {
						this.logger.error(`Módulo '${periodo}' no encontrado en la base de datos.`);
						throw new Error(`Módulo '${periodo}' no encontrado`);
					}
					moduloId = modulo.id;
					modulosCache.set(periodo, moduloId);
				}

				// C. CREAR RESPUESTA (HEADER)
				const nuevaRespuesta = queryRunner.manager.create(EncuestaRespuesta, {
					docenteId: docente.id,
					periodo: periodo,
					grupo: asignatura,
					estudiante: estudiante,
					promedioIndividual: 0,
					comentario: comentario,
					detalles: []
				});

				// D. PROCESAR DETALLES
				const detalles: EncuestaRespuestasDetalle[] = [];
				let sumaPuntos = 0;
				let contadorRespuestas = 0;

				Object.keys(row).forEach((key) => {
					const preguntaId = parseInt(key, 10);
					if (!isNaN(preguntaId) && preguntaId > 0) {
						const valorTexto = row[key];
						if (ESCALA[valorTexto]) {
							const valor = ESCALA[valorTexto];
							sumaPuntos += valor;
							contadorRespuestas++;

							const detalle = queryRunner.manager.create(EncuestaRespuestasDetalle, {
								preguntaId: preguntaId,
								valorTexto: valorTexto,
								valorNumero: valor
							});
							detalles.push(detalle);
						}
					}
				});
				nuevaRespuesta.detalles = detalles;
				nuevaRespuesta.promedioIndividual = contadorRespuestas > 0 ? (sumaPuntos / contadorRespuestas) : 0;
				await queryRunner.manager.save(EncuestaRespuesta, nuevaRespuesta);
			}

			// E. CÁLCULO MASIVO FINAL (Para cada periodo encontrado)
			for (const periodo of periodosProcesados) {
				const mid = modulosCache.get(periodo);
				if (mid !== undefined) {
					await this.actualizarMetricasMasivas(queryRunner, periodo, mid);
				}
			}
			await queryRunner.commitTransaction();
			return { success: true, message: `Procesadas ${rows.length} encuestas correctamente.` };

		} catch (error) {
			this.logger.error('Error procesando CSV:', error);
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	private parseCsv(buffer: Buffer): Promise<any[]> {
		const stream = Readable.from(buffer.toString())
		return new Promise((resolve, reject) => {
			const results: any[] = [];
			stream
				.pipe(csv({ separator: ';', skipLines: 5 }))
				.on('data', (data) => results.push(data))
				.on('end', () => resolve(results))
				.on('error', (error) => reject(error));
		});
	}

	private async actualizarMetricasMasivas(queryRunner: any, periodo: string, moduloId: number) {
		const query = `
		INSERT INTO "encuesta_metricas_docente" 
		("docente_id", "modulo_id", "promedio_general", "total_encuestados", "total_cursos", "fecha_registro")
		SELECT 
			r."docente_id",
			$2 as "modulo_id",
			ROUND(AVG(r."promedio_individual"), 2) as "promedio_general",
			COUNT(r."id") as "total_encuestados",
			COUNT(DISTINCT r."grupo") as "total_cursos",
			NOW() as "fecha_registro"
		FROM "encuesta_respuestas" r
		WHERE r."periodo" = $1
		GROUP BY r."docente_id"
		ON CONFLICT ("docente_id", "modulo_id") DO UPDATE SET
			"promedio_general" = EXCLUDED."promedio_general",
			"total_encuestados" = EXCLUDED."total_encuestados",
			"total_cursos" = EXCLUDED."total_cursos",
			"fecha_registro" = NOW();
		`;
		await queryRunner.query(query, [periodo, moduloId]);
	}
}
