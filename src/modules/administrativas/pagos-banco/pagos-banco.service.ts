import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource, MoreThanOrEqual } from 'typeorm';
import { Readable } from 'stream';
import csvParser = require('csv-parser');
import { CreatePagosBancoDto } from './dto/create-pagos-banco.dto';
import { UpdatePagosBancoDto } from './dto/update-pagos-banco.dto';
import { PagosBanco } from './entities/pagos-banco.entity';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';

@Injectable()
export class PagosBancoService {
	constructor(
		@InjectRepository(PagosBanco)
		private readonly pagosBancoRepository: Repository<PagosBanco>,
		@InjectRepository(Solicitud)
		private readonly solicitudRepository: Repository<Solicitud>,
		private dataSource: DataSource,
	) {}

	async uploadAndProcess(fileBuffer: Buffer): Promise<any> {
		const results: any[] = [];
		const stream = Readable.from(fileBuffer);

		return new Promise((resolve, reject) => {
			stream
				.pipe(
					csvParser({
						separator: ';',
						mapHeaders: ({ header }) =>
							header
								.toLowerCase()
								.trim()
								.normalize('NFD')
								.replace(/[\u0300-\u036f]/g, '')
								.replace(/[^a-z0-9]/g, '_')
								.replace(/__+/g, '_')
								.replace(/^_+|_+$/g, ''),
					}),
				)
				.on('data', (data) => results.push(data))
				.on('end', async () => {
					const queryRunner = this.dataSource.createQueryRunner();
					await queryRunner.connect();
					await queryRunner.startTransaction();

					try {
						const pagosToSave: PagosBanco[] = [];
						const solicitudesToSaveMap = new Map<number, Solicitud>();

						const allVouchers = results
							.map((row) => row.n_voucher)
							.filter((voucher) => !!voucher);
						const uniqueVouchers = [...new Set(allVouchers)];

						// Búsqueda de pagos ya existentes para evitar duplicados
						let existingPagosVouchers = new Set<string>();
						if (uniqueVouchers.length > 0) {
							const existingPagos = await queryRunner.manager.find(PagosBanco, {
								where: { numeroVoucher: In(uniqueVouchers) },
								select: ['numeroVoucher']
							});
							existingPagosVouchers = new Set(existingPagos.map(p => p.numeroVoucher));
						}

						let matchingSolicitudes: Solicitud[] = [];
						if (uniqueVouchers.length > 0) {
							matchingSolicitudes = await queryRunner.manager.find(Solicitud, {
								where: { numeroVoucher: In(uniqueVouchers) },
								relations: ['estudiante', 'estudiante.usuario'],
							});
						}

						const solicitudMap = new Map(
							matchingSolicitudes.map((solicitud) => [
								solicitud.numeroVoucher,
								solicitud,
							]),
						);

						for (const row of results) {
							const numeroVoucher = row.n_voucher;

							// Si el voucher ya existe en la BD de pagos, lo ignoramos para no duplicar
							if (numeroVoucher && existingPagosVouchers.has(numeroVoucher)) {
								continue;
							}

							const parseDate = (value: string): Date | null => {
								if (!value || value.length !== 8) return null;
								return new Date(
									`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`,
								);
							};

							const fechaPago = parseDate(row.fecha_pago);
							const fechaEfectiva = parseDate(row.fecha_efectiva);
							const monto = parseFloat(row.monto);

							const pagoBanco = queryRunner.manager.create(PagosBanco, {
								dniCodigo: row.dni_codigo,
								numeroVoucher,
								alumno: row.alumno,
								monto,
								fechaPago: fechaPago as Date,
								fechaEfectiva: fechaEfectiva as Date,
								voucherRestante: row.voucher_restante,
								archivo: row.archivo,
								verificado: false,
							});

							if (numeroVoucher) {
								const solicitud = solicitudMap.get(numeroVoucher);
								if (solicitud) {
									if (solicitud.estadoId === 1) {
										const isMontoValid = Number(solicitud.pago) === monto;
										const isFechaValid =
											solicitud.fechaPago &&
											fechaPago &&
											new Date(solicitud.fechaPago).toISOString().split('T')[0] ===
												fechaPago.toISOString().split('T')[0];

										if (isMontoValid && isFechaValid) {
											solicitud.estadoId = 4;
											pagoBanco.verificado = true;
										} else {
											solicitud.estadoId = 2;
										}

										solicitudesToSaveMap.set(solicitud.id, solicitud);
									} else if ([2, 3, 4, 5].includes(solicitud.estadoId)) {
										pagoBanco.verificado = true;
									}
								}
							}

							pagosToSave.push(pagoBanco);
						}

						if (solicitudesToSaveMap.size > 0) {
							await queryRunner.manager.save(
								Solicitud,
								Array.from(solicitudesToSaveMap.values()),
								{ chunk: 100 },
							);
						}

						if (pagosToSave.length > 0) {
							await queryRunner.manager.save(PagosBanco, pagosToSave, { chunk: 100 });
						}

						await queryRunner.commitTransaction();

						const { reverifiedCount } = await this.reverifyUnverified();

						resolve({
							message: `Se procesaron ${results.length} registros del CSV (omitiendo duplicados) y se reverificaron ${reverifiedCount} pagos previos pendientes.`,
						});
					} catch (error) {
						await queryRunner.rollbackTransaction();
						reject(error);
					} finally {
						await queryRunner.release();
					}
				})
				.on('error', (error) => reject(error));
		});
	}

	async reverifyUnverified(): Promise<{
		reverifiedCount: number;
	}> {
		const tresMesesAtras = new Date();
		tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

		const unverified = await this.pagosBancoRepository.find({
			where: { 
				verificado: false,
				creadoEn: MoreThanOrEqual(tresMesesAtras)
			},
		});

		if (unverified.length === 0) return { reverifiedCount: 0 };

		const vouchers = unverified
			.map((pago) => pago.numeroVoucher)
			.filter((voucher) => !!voucher);
		const uniqueVouchers = [...new Set(vouchers)];

		if (uniqueVouchers.length === 0) return { reverifiedCount: 0 };

		const solicitudes = await this.solicitudRepository.find({
			where: { numeroVoucher: In(uniqueVouchers) },
			relations: ['estudiante', 'estudiante.usuario'],
		});

		if (solicitudes.length === 0) return { reverifiedCount: 0 };

		const solicitudMap = new Map(
			solicitudes.map((solicitud) => [solicitud.numeroVoucher, solicitud]),
		);
		const solicitudesToSaveMap = new Map<number, Solicitud>();
		const pagosToSave: PagosBanco[] = [];

		for (const pago of unverified) {
			const solicitud = solicitudMap.get(pago.numeroVoucher);
			if (solicitud) {
				if (solicitud.estadoId === 1) {
					const isMontoValid = Number(solicitud.pago) === Number(pago.monto);
					const isFechaValid =
						solicitud.fechaPago &&
						pago.fechaPago &&
						new Date(solicitud.fechaPago).toISOString().split('T')[0] ===
							new Date(pago.fechaPago).toISOString().split('T')[0];

					if (isMontoValid && isFechaValid) {
						solicitud.estadoId = 4;
						pago.verificado = true;
						pagosToSave.push(pago);
					} else {
						solicitud.estadoId = 2;
					}

					solicitudesToSaveMap.set(solicitud.id, solicitud);
				} else if ([2, 3, 4, 5].includes(solicitud.estadoId)) {
					pago.verificado = true;
					pagosToSave.push(pago);
				}
			}
		}

		if (solicitudesToSaveMap.size > 0) {
			await this.solicitudRepository.save(
				Array.from(solicitudesToSaveMap.values()),
				{ chunk: 100 },
			);
		}

		if (pagosToSave.length > 0) {
			await this.pagosBancoRepository.save(pagosToSave, { chunk: 100 });
		}

		return { reverifiedCount: pagosToSave.length };
	}

	async create(createPagosBancoDto: CreatePagosBancoDto): Promise<PagosBanco> {
		const pago = this.pagosBancoRepository.create(createPagosBancoDto);
		return await this.pagosBancoRepository.save(pago);
	}

	async findAll(): Promise<PagosBanco[]> {
		return await this.pagosBancoRepository.find({
			order: { creadoEn: 'DESC' },
		});
	}

	async findOne(id: number): Promise<PagosBanco> {
		const pago = await this.pagosBancoRepository.findOne({ where: { id } });
		if (!pago) {
			throw new NotFoundException(`Pago con ID ${id} no encontrado`);
		}
		return pago;
	}

	async update(
		id: number,
		updatePagosBancoDto: UpdatePagosBancoDto,
	): Promise<PagosBanco> {
		const pago = await this.findOne(id);
		const updated = Object.assign(pago, updatePagosBancoDto);
		return await this.pagosBancoRepository.save(updated);
	}

	async remove(id: number): Promise<void> {
		const pago = await this.findOne(id);
		await this.pagosBancoRepository.remove(pago);
	}
}
