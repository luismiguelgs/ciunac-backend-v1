/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/unbound-method */
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { PagosBancoService } from './pagos-banco.service';
import { PagosBanco } from './entities/pagos-banco.entity';
import { CreatePagosBancoDto } from './dto/create-pagos-banco.dto';
import { FilterPagosBancoDto } from './dto/filter-pagos-banco.dto';
import { UpdatePagosBancoDto } from './dto/update-pagos-banco.dto';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';
import { SolicitudEstadoId } from '../solicitudes/constants/solicitud-estado.constants';
import { AddPeriodoToPagosBanco1784592000000 } from '../../../migrations/1784592000000-add-periodo-to-pagos-banco';

describe('PagosBancoService', () => {
  let service: PagosBancoService;
  let repository: Repository<PagosBanco>;
  let insertedPayments: PagosBanco[];
  let insertedCount: number | undefined;
  let historicalPayments: PagosBanco[];
  let existingPayments: PagosBanco[];
  let matchingSolicitudes: Solicitud[];

  const mockPagosBancoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockSolicitudRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  const insertBuilder = {
    insert: jest.fn(),
    into: jest.fn(),
    values: jest.fn(),
    orIgnore: jest.fn(),
    execute: jest.fn(),
  };

  const mockManager = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  const mockPago = {
    id: 1,
    dniCodigo: '12345678',
    numeroVoucher: 'V001',
    alumno: 'Juan Perez',
    monto: 100.5,
    fechaPago: new Date('2026-07-10T00:00:00.000Z'),
    fechaEfectiva: new Date('2026-07-11T00:00:00.000Z'),
    periodo: '2026-07',
    voucherRestante: null,
    archivo: 'voucher.pdf',
    verificado: false,
    creadoEn: new Date(),
    modificadoEn: new Date(),
  } as PagosBanco;

  beforeEach(async () => {
    jest.clearAllMocks();
    insertedPayments = [];
    insertedCount = undefined;
    historicalPayments = [];
    existingPayments = [];
    matchingSolicitudes = [];

    insertBuilder.insert.mockReturnValue(insertBuilder);
    insertBuilder.into.mockReturnValue(insertBuilder);
    insertBuilder.values.mockImplementation((payments: PagosBanco[]) => {
      insertedPayments = payments;
      return insertBuilder;
    });
    insertBuilder.orIgnore.mockReturnValue(insertBuilder);
    insertBuilder.execute.mockImplementation(() => {
      const count = insertedCount ?? insertedPayments.length;
      return Promise.resolve({
        identifiers: Array.from({ length: count }, (_, index) => ({
          id: index + 1,
        })),
        generatedMaps: [],
        raw: [],
      });
    });

    mockManager.createQueryBuilder.mockReturnValue(insertBuilder);
    mockManager.create.mockImplementation(
      (_entity: typeof PagosBanco, data: Partial<PagosBanco>) => ({ ...data }),
    );
    mockManager.save.mockImplementation((_entity: unknown, data: unknown) =>
      Promise.resolve(data),
    );
    mockManager.find.mockImplementation(
      (entity: unknown, options: { where?: { verificado?: boolean } }) => {
        if (entity === PagosBanco && options.where?.verificado === false) {
          return Promise.resolve(historicalPayments);
        }
        if (entity === PagosBanco) return Promise.resolve(existingPayments);
        if (entity === Solicitud) return Promise.resolve(matchingSolicitudes);
        return Promise.resolve([]);
      },
    );
    mockDataSource.transaction.mockImplementation(
      (callback: (manager: EntityManager) => Promise<unknown>) =>
        callback(mockManager as unknown as EntityManager),
    );
    mockPagosBancoRepository.findOne.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosBancoService,
        {
          provide: getRepositoryToken(PagosBanco),
          useValue: mockPagosBancoRepository,
        },
        {
          provide: getRepositoryToken(Solicitud),
          useValue: mockSolicitudRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<PagosBancoService>(PagosBancoService);
    repository = module.get<Repository<PagosBanco>>(
      getRepositoryToken(PagosBanco),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadAndProcess', () => {
    it('marks a NEW request as PAID using fecha_efectiva, not fecha_pago', async () => {
      const solicitud = createSolicitud();
      matchingSolicitudes = [solicitud];

      const result = await service.uploadAndProcess(
        csvBuffer(['V001;100.50;20260101;20260711;Juan Perez']),
      );

      expect(solicitud.estadoId).toBe(SolicitudEstadoId.PAGADO);
      expect(insertedPayments[0].verificado).toBe(true);
      expect(result.resumen.solicitudesPagadas).toBe(1);
      expect(result.resumen.solicitudesObservadas).toBe(0);
      expect(result.resumen.pagosRegistrados).toBe(1);
      expect(result.message).toBe(
        'Carga completada: 1 pago registrado y 0 duplicados exactos omitidos (voucher + fecha efectiva). Resultado: 1 solicitud pagada, 0 solicitudes observadas y 0 pagos pendientes reverificados.',
      );
    });

    it('derives period from the effective date', async () => {
      await service.uploadAndProcess(
        csvBuffer(['V001;100.50;20260101;20260105;Juan Perez']),
      );

      expect(insertedPayments[0].periodo).toBe('2026-01');
    });

    it.each([
      ['different amount', 'V001;99.50;20260710;20260711;Juan Perez'],
      ['different effective date', 'V001;100.50;20260711;20260712;Juan Perez'],
      ['different amount and date', 'V001;99.50;20260711;20260712;Juan Perez'],
    ])('marks a NEW request as OBSERVED for %s', async (_case, row) => {
      const solicitud = createSolicitud();
      matchingSolicitudes = [solicitud];

      const result = await service.uploadAndProcess(csvBuffer([row]));

      expect(solicitud.estadoId).toBe(SolicitudEstadoId.OBSERVADO);
      expect(insertedPayments[0].verificado).toBe(true);
      expect(result.resumen.solicitudesObservadas).toBe(1);
    });

    it.each([
      SolicitudEstadoId.ASIGNADO,
      SolicitudEstadoId.TERMINADO,
      SolicitudEstadoId.PAGADO,
      SolicitudEstadoId.RECHAZADO,
      SolicitudEstadoId.OBSERVADO,
    ])('keeps state %s and only verifies the payment', async (estadoId) => {
      const solicitud = createSolicitud({ estadoId });
      matchingSolicitudes = [solicitud];

      const result = await service.uploadAndProcess(
        csvBuffer(['V001;1.00;20260101;20260101;Juan Perez']),
      );

      expect(solicitud.estadoId).toBe(estadoId);
      expect(insertedPayments[0].verificado).toBe(true);
      expect(result.resumen.vouchersVerificadosSinCambio).toBe(1);
    });

    it('keeps a payment pending when its voucher has no request', async () => {
      const result = await service.uploadAndProcess(
        csvBuffer(['V404;100.50;20260710;20260711;Juan Perez']),
      );

      expect(insertedPayments[0].verificado).toBe(false);
      expect(result.resumen.vouchersSinSolicitud).toBe(1);
    });

    it('reports unknown request states without changing them', async () => {
      const solicitud = createSolicitud({ estadoId: 99 });
      matchingSolicitudes = [solicitud];

      const result = await service.uploadAndProcess(
        csvBuffer(['V001;100.50;20260710;20260711;Juan Perez']),
      );

      expect(solicitud.estadoId).toBe(99);
      expect(insertedPayments[0].verificado).toBe(false);
      expect(result.resumen.estadosDesconocidos).toBe(1);
    });

    it('omits exact database and in-file payment keys', async () => {
      existingPayments = [
        {
          numeroVoucher: 'V002',
          fechaEfectiva: new Date('2026-07-11T00:00:00.000Z'),
        } as PagosBanco,
      ];

      const result = await service.uploadAndProcess(
        csvBuffer([
          'V001;100.50;20260710;20260711;Juan Perez',
          'V001;100.50;20260710;20260711;Juan Perez',
          'V002;100.50;20260710;20260711;Juan Perez',
        ]),
      );

      expect(insertedPayments).toHaveLength(1);
      expect(result.resumen.pagosRegistrados).toBe(1);
      expect(result.resumen.duplicadosOmitidos).toBe(2);
    });

    it('registers the same voucher with different effective dates', async () => {
      const result = await service.uploadAndProcess(
        csvBuffer([
          'V001;100.50;20260710;20260711;Juan Perez',
          'V001;100.50;20260710;20260712;Juan Perez',
        ]),
      );

      expect(insertedPayments).toHaveLength(2);
      expect(result.resumen.pagosRegistrados).toBe(2);
      expect(result.resumen.duplicadosOmitidos).toBe(0);
    });

    it('registers a voucher when only another effective date exists', async () => {
      existingPayments = [
        {
          numeroVoucher: 'V001',
          fechaEfectiva: new Date('2026-07-11T00:00:00.000Z'),
        } as PagosBanco,
      ];

      const result = await service.uploadAndProcess(
        csvBuffer(['V001;100.50;20260710;20260712;Juan Perez']),
      );

      expect(insertedPayments).toHaveLength(1);
      expect(result.resumen.pagosRegistrados).toBe(1);
      expect(result.resumen.duplicadosOmitidos).toBe(0);
    });

    it('registers different vouchers with the same effective date', async () => {
      const result = await service.uploadAndProcess(
        csvBuffer([
          'V001;100.50;20260710;20260711;Juan Perez',
          'V002;100.50;20260710;20260711;Juan Perez',
        ]),
      );

      expect(insertedPayments).toHaveLength(2);
      expect(result.resumen.pagosRegistrados).toBe(2);
      expect(result.resumen.duplicadosOmitidos).toBe(0);
    });

    it('omits the same voucher and effective date regardless of other fields', async () => {
      const result = await service.uploadAndProcess(
        csvBuffer([
          'V001;100.50;20260710;20260711;Juan Perez',
          'V001;999.99;20260101;20260711;Otro Alumno',
        ]),
      );

      expect(insertedPayments).toHaveLength(1);
      expect(result.resumen.pagosRegistrados).toBe(1);
      expect(result.resumen.duplicadosOmitidos).toBe(1);
    });

    it('counts a concurrent unique collision as an omitted duplicate', async () => {
      insertedCount = 1;

      const result = await service.uploadAndProcess(
        csvBuffer([
          'V001;100.50;20260710;20260711;Juan Perez',
          'V002;100.50;20260710;20260711;Juan Perez',
        ]),
      );

      expect(result.resumen.pagosRegistrados).toBe(1);
      expect(result.resumen.duplicadosOmitidos).toBe(1);
    });

    it.each([
      [
        'missing required header',
        'N Voucher;Monto;Fecha Pago\nV001;100.50;20260710',
      ],
      [
        'invalid amount',
        csvText(['V001;invalid;20260710;20260711;Juan Perez']),
      ],
      [
        'invalid effective date',
        csvText(['V001;100.50;20260710;20260230;Juan Perez']),
      ],
    ])('rejects the complete CSV for %s', async (_case, csv) => {
      await expect(service.uploadAndProcess(Buffer.from(csv))).rejects.toThrow(
        BadRequestException,
      );
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it('returns row, field and message details for invalid rows', async () => {
      try {
        await service.uploadAndProcess(
          csvBuffer(['V001;100.50;20260710;20260230;Juan Perez']),
        );
        fail('Expected CSV validation to fail');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        const response = (error as BadRequestException).getResponse() as {
          totalErrores: number;
          errores: Array<{ fila: number; campo: string; mensaje: string }>;
        };
        expect(response.totalErrores).toBe(1);
        expect(response.errores[0]).toEqual({
          fila: 2,
          campo: 'fecha_efectiva',
          mensaje:
            'La fecha efectiva debe ser una fecha real con formato YYYYMMDD.',
        });
      }
    });

    it('returns a safe error when transactional persistence fails', async () => {
      mockManager.save.mockRejectedValueOnce(new Error('database detail'));
      matchingSolicitudes = [createSolicitud()];

      await expect(
        service.uploadAndProcess(
          csvBuffer(['V001;100.50;20260710;20260711;Juan Perez']),
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('reverifyUnverified', () => {
    it('reverifies recent pending payments with the same rules', async () => {
      const solicitud = createSolicitud();
      const pago = {
        ...mockPago,
        verificado: false,
        fechaPago: new Date('2026-01-01T00:00:00.000Z'),
        fechaEfectiva: new Date('2026-07-11T00:00:00.000Z'),
      } as PagosBanco;
      historicalPayments = [pago];
      matchingSolicitudes = [solicitud];

      const result = await service.reverifyUnverified();

      expect(solicitud.estadoId).toBe(SolicitudEstadoId.PAGADO);
      expect(pago.verificado).toBe(true);
      expect(result.resumen.pagosEvaluados).toBe(1);
      expect(result.resumen.pagosVerificados).toBe(1);
      expect(result.message).toBe(
        'Reverificación completada: 1 pago evaluado, 1 pago verificado, 1 solicitud pagada y 0 solicitudes observadas.',
      );
    });

    it('keeps the three-month filter in the database query', async () => {
      await service.reverifyUnverified();

      const options = mockManager.find.mock.calls[0][1] as {
        where: { creadoEn: { _type: string } };
      };
      expect(options.where.creadoEn._type).toBe('moreThanOrEqual');
    });
  });

  describe('CRUD', () => {
    it('creates an unverified payment', async () => {
      const createDto = {
        dniCodigo: '12345678',
        numeroVoucher: ' V001 ',
        fechaEfectiva: '2026-01-05',
      };
      mockPagosBancoRepository.create.mockReturnValue(mockPago);
      mockPagosBancoRepository.save.mockResolvedValue(mockPago);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          numeroVoucher: 'V001',
          periodo: '2026-01',
          verificado: false,
        }),
      );
      expect(result).toEqual(mockPago);
    });

    it('checks manual creation using voucher and effective date', async () => {
      mockPagosBancoRepository.create.mockReturnValue(mockPago);
      mockPagosBancoRepository.save.mockResolvedValue(mockPago);

      await service.create({
        numeroVoucher: ' V001 ',
        fechaEfectiva: '2026-07-12',
      });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          numeroVoucher: 'V001',
          fechaEfectiva: new Date('2026-07-12T00:00:00.000Z'),
        },
      });
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ periodo: '2026-07' }),
      );
      expect(repository.save).toHaveBeenCalled();
    });

    it('rejects manual creation with an existing exact payment key', async () => {
      mockPagosBancoRepository.findOne.mockResolvedValue({
        ...mockPago,
        id: 2,
      });

      await expect(
        service.create({
          numeroVoucher: 'V001',
          fechaEfectiva: '2026-07-11',
        }),
      ).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('filters payments by period and orders them by creation date', async () => {
      mockPagosBancoRepository.find.mockResolvedValue([mockPago]);

      const result = await service.findAll('2026-01');

      expect(repository.find).toHaveBeenCalledWith({
        where: { periodo: '2026-01' },
        order: { creadoEn: 'DESC' },
      });
      expect(result).toEqual([mockPago]);
    });

    it('returns an empty list when the period has no payments', async () => {
      mockPagosBancoRepository.find.mockResolvedValue([]);

      await expect(service.findAll('2026-02')).resolves.toEqual([]);
    });

    it('returns one payment', async () => {
      mockPagosBancoRepository.findOne.mockResolvedValue(mockPago);

      await expect(service.findOne(1)).resolves.toEqual(mockPago);
    });

    it('throws when a payment does not exist', async () => {
      mockPagosBancoRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('updates an existing payment', async () => {
      const existingPago = { ...mockPago } as PagosBanco;
      mockPagosBancoRepository.findOne.mockResolvedValue(existingPago);
      mockPagosBancoRepository.save.mockResolvedValue({
        ...existingPago,
        alumno: 'Juan Updated',
      });

      const result = await service.update(1, { alumno: 'Juan Updated' });

      expect(repository.save).toHaveBeenCalled();
      expect(result.alumno).toBe('Juan Updated');
    });

    it('allows changing to a different effective date for the same voucher', async () => {
      const existingPago = { ...mockPago } as PagosBanco;
      mockPagosBancoRepository.findOne
        .mockResolvedValueOnce(existingPago)
        .mockResolvedValueOnce(null);
      mockPagosBancoRepository.save.mockImplementation((pago) =>
        Promise.resolve(pago),
      );

      const result = await service.update(1, {
        fechaEfectiva: '2026-07-12',
      });

      expect(repository.findOne).toHaveBeenLastCalledWith({
        where: {
          numeroVoucher: 'V001',
          fechaEfectiva: new Date('2026-07-12T00:00:00.000Z'),
        },
      });
      expect(result.fechaEfectiva).toEqual(
        new Date('2026-07-12T00:00:00.000Z'),
      );
      expect(result.periodo).toBe('2026-07');
    });

    it('repairs the period when updating a historical payment', async () => {
      const existingPago = { ...mockPago, periodo: null } as PagosBanco;
      mockPagosBancoRepository.findOne.mockResolvedValue(existingPago);
      mockPagosBancoRepository.save.mockImplementation((pago) =>
        Promise.resolve(pago),
      );

      const result = await service.update(1, { alumno: 'Juan Updated' });

      expect(result.periodo).toBe('2026-07');
    });

    it('rejects changing to an existing exact payment key', async () => {
      const existingPago = { ...mockPago } as PagosBanco;
      const conflictingPago = {
        ...mockPago,
        id: 2,
        fechaEfectiva: new Date('2026-07-12T00:00:00.000Z'),
      } as PagosBanco;
      mockPagosBancoRepository.findOne
        .mockResolvedValueOnce(existingPago)
        .mockResolvedValueOnce(conflictingPago);

      await expect(
        service.update(1, { fechaEfectiva: '2026-07-12' }),
      ).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('removes an existing payment', async () => {
      mockPagosBancoRepository.findOne.mockResolvedValue(mockPago);
      mockPagosBancoRepository.remove.mockResolvedValue(mockPago);

      await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(mockPago);
    });
  });

  function createSolicitud(overrides: Partial<Solicitud> = {}): Solicitud {
    return {
      id: 10,
      numeroVoucher: 'V001',
      pago: 100.5,
      fechaPago: new Date('2026-07-11T00:00:00.000Z'),
      estadoId: SolicitudEstadoId.NUEVO,
      ...overrides,
    } as Solicitud;
  }

  function csvBuffer(rows: string[]): Buffer {
    return Buffer.from(csvText(rows));
  }

  function csvText(rows: string[]): string {
    return ['N Voucher;Monto;Fecha Pago;Fecha Efectiva;Alumno', ...rows].join(
      '\n',
    );
  }
});

describe('CreatePagosBancoDto', () => {
  it('requires an effective date for manual creation', async () => {
    const dto = Object.assign(new CreatePagosBancoDto(), {
      numeroVoucher: 'V001',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'fechaEfectiva')).toBe(
      true,
    );
  });

  it('keeps the effective date optional for manual updates', async () => {
    const errors = await validate(new UpdatePagosBancoDto());

    expect(errors).toHaveLength(0);
  });
});

describe('FilterPagosBancoDto', () => {
  it('accepts a valid period', async () => {
    const dto = Object.assign(new FilterPagosBancoDto(), {
      periodo: '2026-01',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each([undefined, '2026-1', '2026-00', '2026-13'])(
    'rejects invalid period %s',
    async (periodo) => {
      const dto = Object.assign(new FilterPagosBancoDto(), { periodo });

      const errors = await validate(dto);

      expect(errors.some((error) => error.property === 'periodo')).toBe(true);
    },
  );
});

describe('AddPeriodoToPagosBanco1784592000000', () => {
  it('adds, backfills and constrains the period column', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const queryRunner = { query } as unknown as QueryRunner;
    const migration = new AddPeriodoToPagosBanco1784592000000();

    await migration.up(queryRunner);

    const statements = query.mock.calls
      .map(([statement]: [string]) => statement)
      .join('\n');
    expect(statements).toContain('ADD COLUMN periodo varchar(7)');
    expect(statements).toContain(
      "SET periodo = to_char(fecha_efectiva, 'YYYY-MM')",
    );
    expect(statements).toContain('CK_pagos_banco_periodo_fecha_efectiva');
    expect(statements).toContain('fecha_efectiva IS NULL AND periodo IS NULL');
    expect(statements).toContain('AND periodo IS NOT NULL');
  });
});
