import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  In,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { CreatePagosBancoDto } from './dto/create-pagos-banco.dto';
import { UpdatePagosBancoDto } from './dto/update-pagos-banco.dto';
import { PagosBanco } from './entities/pagos-banco.entity';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';
import { SolicitudEstadoId } from '../solicitudes/constants/solicitud-estado.constants';
import {
  PAGOS_CSV_MAX_FILE_SIZE_BYTES,
  PAGOS_CSV_MAX_REPORTED_ERRORS,
  PAGOS_CSV_MAX_ROWS,
  PAGOS_CSV_REQUIRED_HEADERS,
} from './pagos-banco.constants';
import {
  CsvValidationError,
  PagosBancoCsvRow,
  ReverifyPagosBancoResult,
  ReverifyPagosBancoSummary,
  UploadPagosBancoResult,
  UploadPagosBancoSummary,
} from './interfaces/pagos-banco-processing.interface';

interface ParsedBankDate {
  date: Date;
}

interface ValidatedPagosBancoRow {
  fila: number;
  dniCodigo?: string;
  numeroVoucher: string;
  alumno?: string;
  monto: number;
  fechaPago?: Date;
  fechaEfectiva: Date;
  voucherRestante?: string;
  archivo?: string;
}

type ConciliationOutcome =
  | 'PAGADO'
  | 'OBSERVADO'
  | 'SIN_CAMBIO'
  | 'ESTADO_DESCONOCIDO';

const ESTADOS_VERIFICABLES_SIN_CAMBIO = new Set<SolicitudEstadoId>([
  SolicitudEstadoId.ASIGNADO,
  SolicitudEstadoId.TERMINADO,
  SolicitudEstadoId.PAGADO,
  SolicitudEstadoId.RECHAZADO,
  SolicitudEstadoId.OBSERVADO,
]);

@Injectable()
export class PagosBancoService {
  private readonly logger = new Logger(PagosBancoService.name);

  constructor(
    @InjectRepository(PagosBanco)
    private readonly pagosBancoRepository: Repository<PagosBanco>,
    private readonly dataSource: DataSource,
  ) {}

  async uploadAndProcess(fileBuffer: Buffer): Promise<UploadPagosBancoResult> {
    const rows = await this.parseAndValidateCsv(fileBuffer);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const reverifySummary =
          await this.reverifyUnverifiedWithManager(manager);
        const resumen = this.createUploadSummary(
          rows.length,
          reverifySummary.pagosVerificados,
        );

        const uniqueVouchers = [
          ...new Set(rows.map((row) => row.numeroVoucher)),
        ];
        const existingPagos = await manager.find(PagosBanco, {
          where: { numeroVoucher: In(uniqueVouchers) },
          select: ['numeroVoucher', 'fechaEfectiva'],
        });
        const seenPaymentKeys = new Set(
          existingPagos
            .map((pago) =>
              this.buildPaymentKey(pago.numeroVoucher, pago.fechaEfectiva),
            )
            .filter((key): key is string => !!key),
        );

        const solicitudes = await manager.find(Solicitud, {
          where: { numeroVoucher: In(uniqueVouchers) },
        });
        const solicitudMap = new Map(
          solicitudes.map((solicitud) => [
            solicitud.numeroVoucher.trim(),
            solicitud,
          ]),
        );
        const solicitudesToSave = new Map<number, Solicitud>();
        const pagosToInsert: PagosBanco[] = [];

        for (const row of rows) {
          const paymentKey = this.buildPaymentKey(
            row.numeroVoucher,
            row.fechaEfectiva,
          );

          if (paymentKey && seenPaymentKeys.has(paymentKey)) {
            resumen.duplicadosOmitidos++;
            continue;
          }

          if (paymentKey) seenPaymentKeys.add(paymentKey);
          const pagoBanco = manager.create(PagosBanco, {
            dniCodigo: row.dniCodigo,
            numeroVoucher: row.numeroVoucher,
            alumno: row.alumno,
            monto: row.monto,
            fechaPago: row.fechaPago,
            fechaEfectiva: row.fechaEfectiva,
            periodo: this.toPeriod(row.fechaEfectiva),
            voucherRestante: row.voucherRestante,
            archivo: row.archivo,
            verificado: false,
          });

          const solicitud = solicitudMap.get(row.numeroVoucher);
          if (!solicitud) {
            resumen.vouchersSinSolicitud++;
          } else {
            const outcome = this.conciliate(solicitud, pagoBanco);
            this.applyUploadOutcome(resumen, outcome);
            if (outcome === 'PAGADO' || outcome === 'OBSERVADO') {
              solicitudesToSave.set(solicitud.id, solicitud);
            }
          }

          pagosToInsert.push(pagoBanco);
        }

        if (solicitudesToSave.size > 0) {
          await manager.save(
            Solicitud,
            Array.from(solicitudesToSave.values()),
            { chunk: 100 },
          );
        }

        const insertedCount = await this.insertPaymentsIgnoringConflicts(
          manager,
          pagosToInsert,
        );
        resumen.pagosRegistrados = insertedCount;
        resumen.duplicadosOmitidos += pagosToInsert.length - insertedCount;

        return {
          message: this.buildUploadMessage(resumen),
          resumen,
        };
      });
    } catch (error) {
      this.logger.error(
        `No se pudo procesar el archivo de pagos: ${this.errorMessage(error)}`,
      );
      throw new InternalServerErrorException(
        'No se pudo procesar el archivo de pagos bancarios.',
      );
    }
  }

  async reverifyUnverified(): Promise<ReverifyPagosBancoResult> {
    try {
      const resumen = await this.dataSource.transaction((manager) =>
        this.reverifyUnverifiedWithManager(manager),
      );

      return {
        message: this.buildReverifyMessage(resumen),
        resumen,
      };
    } catch (error) {
      this.logger.error(
        `No se pudieron reverificar los pagos: ${this.errorMessage(error)}`,
      );
      throw new InternalServerErrorException(
        'No se pudieron reverificar los pagos bancarios.',
      );
    }
  }

  async create(createPagosBancoDto: CreatePagosBancoDto): Promise<PagosBanco> {
    const numeroVoucher = createPagosBancoDto.numeroVoucher?.trim();
    const fechaPago = this.parseDtoDate(createPagosBancoDto.fechaPago);
    const fechaEfectiva = this.parseDtoDate(createPagosBancoDto.fechaEfectiva);
    await this.ensurePaymentKeyIsAvailable(numeroVoucher, fechaEfectiva);

    const pago = this.pagosBancoRepository.create({
      ...createPagosBancoDto,
      numeroVoucher,
      fechaPago,
      fechaEfectiva,
      periodo: this.toPeriod(fechaEfectiva),
      verificado: false,
    });
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
    const numeroVoucher = updatePagosBancoDto.numeroVoucher?.trim();
    const fechaEfectiva =
      updatePagosBancoDto.fechaEfectiva !== undefined
        ? this.parseDtoDate(updatePagosBancoDto.fechaEfectiva)
        : pago.fechaEfectiva;
    const finalNumeroVoucher = numeroVoucher ?? pago.numeroVoucher?.trim();
    const currentPaymentKey = this.buildPaymentKey(
      pago.numeroVoucher,
      pago.fechaEfectiva,
    );
    const finalPaymentKey = this.buildPaymentKey(
      finalNumeroVoucher,
      fechaEfectiva,
    );

    if (finalPaymentKey && finalPaymentKey !== currentPaymentKey) {
      await this.ensurePaymentKeyIsAvailable(
        finalNumeroVoucher,
        fechaEfectiva,
        id,
      );
    }

    Object.assign(pago, updatePagosBancoDto, {
      ...(numeroVoucher !== undefined && { numeroVoucher }),
      ...(updatePagosBancoDto.fechaPago !== undefined && {
        fechaPago: this.parseDtoDate(updatePagosBancoDto.fechaPago),
      }),
      ...(updatePagosBancoDto.fechaEfectiva !== undefined && {
        fechaEfectiva,
      }),
      periodo: this.toPeriod(fechaEfectiva),
    });
    return await this.pagosBancoRepository.save(pago);
  }

  async remove(id: number): Promise<void> {
    const pago = await this.findOne(id);
    await this.pagosBancoRepository.remove(pago);
  }

  private async parseAndValidateCsv(
    fileBuffer: Buffer,
  ): Promise<ValidatedPagosBancoRow[]> {
    if (fileBuffer.length > PAGOS_CSV_MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'El archivo CSV supera el límite permitido de 10 MB.',
        totalErrores: 1,
        errores: [
          {
            fila: 0,
            campo: 'file',
            mensaje: 'El archivo no puede superar los 10 MB.',
          },
        ],
      });
    }

    const rawRows: PagosBancoCsvRow[] = [];
    let headers: string[] = [];
    const parser = csvParser({
      separator: ';',
      mapHeaders: ({ header }) => this.normalizeHeader(header),
    });
    parser.on('headers', (parsedHeaders: string[]) => {
      headers = parsedHeaders;
    });

    try {
      const stream = Readable.from(fileBuffer).pipe(parser);
      for await (const rawRow of stream) {
        if (rawRows.length >= PAGOS_CSV_MAX_ROWS) {
          throw new BadRequestException({
            statusCode: 400,
            message: 'El archivo CSV supera el límite de 50 000 filas.',
            totalErrores: 1,
            errores: [
              {
                fila: PAGOS_CSV_MAX_ROWS + 2,
                campo: 'file',
                mensaje: 'El archivo no puede superar las 50 000 filas.',
              },
            ],
          });
        }
        rawRows.push(rawRow as PagosBancoCsvRow);
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException({
        statusCode: 400,
        message: 'No se pudo leer el archivo CSV.',
        totalErrores: 1,
        errores: [
          {
            fila: 0,
            campo: 'file',
            mensaje: 'El archivo está dañado o no tiene un formato CSV válido.',
          },
        ],
      });
    }

    const missingHeaders = PAGOS_CSV_REQUIRED_HEADERS.filter(
      (header) => !headers.includes(header),
    );
    if (missingHeaders.length > 0) {
      this.throwCsvValidationErrors(
        missingHeaders.map((header) => ({
          fila: 1,
          campo: header,
          mensaje: `Falta el encabezado obligatorio ${header}.`,
        })),
        missingHeaders.length,
      );
    }

    if (rawRows.length === 0) {
      this.throwCsvValidationErrors(
        [
          {
            fila: 2,
            campo: 'file',
            mensaje: 'El archivo CSV no contiene registros.',
          },
        ],
        1,
      );
    }

    return this.validateRows(rawRows);
  }

  private validateRows(rawRows: PagosBancoCsvRow[]): ValidatedPagosBancoRow[] {
    const errors: CsvValidationError[] = [];
    const validRows: ValidatedPagosBancoRow[] = [];
    let totalErrors = 0;

    const addError = (error: CsvValidationError): void => {
      totalErrors++;
      if (errors.length < PAGOS_CSV_MAX_REPORTED_ERRORS) {
        errors.push(error);
      }
    };

    rawRows.forEach((rawRow, index) => {
      const fila = index + 2;
      const rowErrorsBefore = totalErrors;
      const numeroVoucher = rawRow.n_voucher?.trim() ?? '';
      const montoText = rawRow.monto?.trim() ?? '';
      const fechaEfectivaText = rawRow.fecha_efectiva?.trim() ?? '';
      const fechaPagoText = rawRow.fecha_pago?.trim() ?? '';

      if (!numeroVoucher) {
        addError({
          fila,
          campo: 'n_voucher',
          mensaje: 'El voucher es obligatorio.',
        });
      }

      const monto = this.parseAmount(montoText);
      if (monto === null || monto <= 0) {
        addError({
          fila,
          campo: 'monto',
          mensaje:
            'El monto debe ser un número positivo con máximo dos decimales.',
        });
      }

      const fechaEfectiva = this.parseBankDate(fechaEfectivaText);
      if (!fechaEfectiva) {
        addError({
          fila,
          campo: 'fecha_efectiva',
          mensaje:
            'La fecha efectiva debe ser una fecha real con formato YYYYMMDD.',
        });
      }

      const fechaPago = fechaPagoText
        ? this.parseBankDate(fechaPagoText)
        : null;
      if (fechaPagoText && !fechaPago) {
        addError({
          fila,
          campo: 'fecha_pago',
          mensaje:
            'La fecha de pago debe ser una fecha real con formato YYYYMMDD.',
        });
      }

      if (rowErrorsBefore === totalErrors && monto !== null && fechaEfectiva) {
        validRows.push({
          fila,
          dniCodigo: this.trimOptional(rawRow.dni_codigo),
          numeroVoucher,
          alumno: this.trimOptional(rawRow.alumno),
          monto,
          fechaPago: fechaPago?.date,
          fechaEfectiva: fechaEfectiva.date,
          voucherRestante: this.trimOptional(rawRow.voucher_restante),
          archivo: this.trimOptional(rawRow.archivo),
        });
      }
    });

    if (totalErrors > 0) {
      this.throwCsvValidationErrors(errors, totalErrors);
    }

    return validRows;
  }

  private async reverifyUnverifiedWithManager(
    manager: EntityManager,
  ): Promise<ReverifyPagosBancoSummary> {
    const summary = this.createReverifySummary();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const unverified = await manager.find(PagosBanco, {
      where: {
        verificado: false,
        creadoEn: MoreThanOrEqual(threeMonthsAgo),
      },
    });
    summary.pagosEvaluados = unverified.length;

    if (unverified.length === 0) return summary;

    const vouchers = [
      ...new Set(
        unverified
          .map((pago) => pago.numeroVoucher?.trim())
          .filter((voucher): voucher is string => !!voucher),
      ),
    ];
    const solicitudes =
      vouchers.length > 0
        ? await manager.find(Solicitud, {
            where: { numeroVoucher: In(vouchers) },
          })
        : [];
    const solicitudMap = new Map(
      solicitudes.map((solicitud) => [
        solicitud.numeroVoucher.trim(),
        solicitud,
      ]),
    );
    const solicitudesToSave = new Map<number, Solicitud>();
    const pagosToSave: PagosBanco[] = [];

    for (const pago of unverified) {
      const voucher = pago.numeroVoucher?.trim();
      const solicitud = voucher ? solicitudMap.get(voucher) : undefined;

      if (!solicitud) {
        summary.vouchersSinSolicitud++;
        continue;
      }

      const outcome = this.conciliate(solicitud, pago);
      this.applyReverifyOutcome(summary, outcome);
      if (outcome === 'PAGADO' || outcome === 'OBSERVADO') {
        solicitudesToSave.set(solicitud.id, solicitud);
      }
      if (pago.verificado) {
        pagosToSave.push(pago);
      }
    }

    if (solicitudesToSave.size > 0) {
      await manager.save(Solicitud, Array.from(solicitudesToSave.values()), {
        chunk: 100,
      });
    }
    if (pagosToSave.length > 0) {
      await manager.save(PagosBanco, pagosToSave, { chunk: 100 });
    }

    return summary;
  }

  private conciliate(
    solicitud: Solicitud,
    pagoBanco: PagosBanco,
  ): ConciliationOutcome {
    const estadoId = solicitud.estadoId as SolicitudEstadoId;
    if (estadoId === SolicitudEstadoId.NUEVO) {
      const amountMatches =
        this.toCents(solicitud.pago) === this.toCents(pagoBanco.monto);
      const effectiveDateMatches =
        this.toDateOnly(solicitud.fechaPago) ===
        this.toDateOnly(pagoBanco.fechaEfectiva);

      pagoBanco.verificado = true;
      if (amountMatches && effectiveDateMatches) {
        solicitud.estadoId = SolicitudEstadoId.PAGADO;
        return 'PAGADO';
      }

      solicitud.estadoId = SolicitudEstadoId.OBSERVADO;
      return 'OBSERVADO';
    }

    if (
      ESTADOS_VERIFICABLES_SIN_CAMBIO.has(
        solicitud.estadoId as SolicitudEstadoId,
      )
    ) {
      pagoBanco.verificado = true;
      return 'SIN_CAMBIO';
    }

    return 'ESTADO_DESCONOCIDO';
  }

  private async insertPaymentsIgnoringConflicts(
    manager: EntityManager,
    payments: PagosBanco[],
  ): Promise<number> {
    if (payments.length === 0) return 0;

    const result = await manager
      .createQueryBuilder()
      .insert()
      .into(PagosBanco)
      .values(payments)
      .orIgnore()
      .execute();

    return result.identifiers.length;
  }

  private createUploadSummary(
    registrosLeidos: number,
    pagosPreviosReverificados: number,
  ): UploadPagosBancoSummary {
    return {
      registrosLeidos,
      pagosRegistrados: 0,
      duplicadosOmitidos: 0,
      vouchersSinSolicitud: 0,
      solicitudesPagadas: 0,
      solicitudesObservadas: 0,
      vouchersVerificadosSinCambio: 0,
      estadosDesconocidos: 0,
      pagosPreviosReverificados,
    };
  }

  private createReverifySummary(): ReverifyPagosBancoSummary {
    return {
      pagosEvaluados: 0,
      pagosVerificados: 0,
      solicitudesPagadas: 0,
      solicitudesObservadas: 0,
      vouchersSinSolicitud: 0,
      estadosSinCambio: 0,
      estadosDesconocidos: 0,
    };
  }

  private applyUploadOutcome(
    summary: UploadPagosBancoSummary,
    outcome: ConciliationOutcome,
  ): void {
    if (outcome === 'PAGADO') summary.solicitudesPagadas++;
    if (outcome === 'OBSERVADO') summary.solicitudesObservadas++;
    if (outcome === 'SIN_CAMBIO') summary.vouchersVerificadosSinCambio++;
    if (outcome === 'ESTADO_DESCONOCIDO') summary.estadosDesconocidos++;
  }

  private applyReverifyOutcome(
    summary: ReverifyPagosBancoSummary,
    outcome: ConciliationOutcome,
  ): void {
    if (outcome !== 'ESTADO_DESCONOCIDO') summary.pagosVerificados++;
    if (outcome === 'PAGADO') summary.solicitudesPagadas++;
    if (outcome === 'OBSERVADO') summary.solicitudesObservadas++;
    if (outcome === 'SIN_CAMBIO') summary.estadosSinCambio++;
    if (outcome === 'ESTADO_DESCONOCIDO') summary.estadosDesconocidos++;
  }

  private buildUploadMessage(summary: UploadPagosBancoSummary): string {
    return `Carga completada: ${this.formatCount(summary.pagosRegistrados, 'pago registrado', 'pagos registrados')} y ${this.formatCount(summary.duplicadosOmitidos, 'duplicado exacto omitido (voucher + fecha efectiva)', 'duplicados exactos omitidos (voucher + fecha efectiva)')}. Resultado: ${this.formatCount(summary.solicitudesPagadas, 'solicitud pagada', 'solicitudes pagadas')}, ${this.formatCount(summary.solicitudesObservadas, 'solicitud observada', 'solicitudes observadas')} y ${this.formatCount(summary.pagosPreviosReverificados, 'pago pendiente reverificado', 'pagos pendientes reverificados')}.`;
  }

  private buildReverifyMessage(summary: ReverifyPagosBancoSummary): string {
    return `Reverificación completada: ${this.formatCount(summary.pagosEvaluados, 'pago evaluado', 'pagos evaluados')}, ${this.formatCount(summary.pagosVerificados, 'pago verificado', 'pagos verificados')}, ${this.formatCount(summary.solicitudesPagadas, 'solicitud pagada', 'solicitudes pagadas')} y ${this.formatCount(summary.solicitudesObservadas, 'solicitud observada', 'solicitudes observadas')}.`;
  }

  private formatCount(count: number, singular: string, plural: string): string {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  private normalizeHeader(header: string): string {
    return header
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/__+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private parseBankDate(value: string): ParsedBankDate | null {
    if (!/^\d{8}$/.test(value)) return null;

    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6));
    const day = Number(value.slice(6, 8));
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return { date };
  }

  private parseAmount(value: string): number | null {
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) return null;
    const amount = Number(value.replace(',', '.'));
    return Number.isFinite(amount) ? amount : null;
  }

  private toCents(value: number | string): number | null {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? Math.round(numberValue * 100) : null;
  }

  private toDateOnly(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime())
      ? null
      : date.toISOString().slice(0, 10);
  }

  private buildPaymentKey(
    numeroVoucher: string | null | undefined,
    fechaEfectiva: Date | string | null | undefined,
  ): string | null {
    const voucher = numeroVoucher?.trim();
    const effectiveDate = this.toDateOnly(fechaEfectiva);
    return voucher && effectiveDate
      ? JSON.stringify([voucher, effectiveDate])
      : null;
  }

  private toPeriod(
    fechaEfectiva: Date | string | null | undefined,
  ): string | null {
    return this.toDateOnly(fechaEfectiva)?.slice(0, 7) ?? null;
  }

  private parseDtoDate(value?: string): Date | undefined {
    return value ? new Date(value) : undefined;
  }

  private trimOptional(value?: string): string | undefined {
    const trimmed = value?.trim();
    return trimmed || undefined;
  }

  private throwCsvValidationErrors(
    errors: CsvValidationError[],
    totalErrors: number,
  ): never {
    throw new BadRequestException({
      statusCode: 400,
      message: 'El archivo CSV contiene datos inválidos.',
      totalErrores: totalErrors,
      erroresOmitidos: Math.max(0, totalErrors - errors.length),
      errores: errors,
    });
  }

  private async ensurePaymentKeyIsAvailable(
    numeroVoucher?: string,
    fechaEfectiva?: Date,
    excludedId?: number,
  ): Promise<void> {
    if (!numeroVoucher || !fechaEfectiva) return;

    const existing = await this.pagosBancoRepository.findOne({
      where: { numeroVoucher, fechaEfectiva },
    });
    if (existing && existing.id !== excludedId) {
      throw new ConflictException(
        `Ya existe un pago con el voucher ${numeroVoucher} y fecha efectiva ${this.toDateOnly(fechaEfectiva)}.`,
      );
    }
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
