/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/unbound-method */
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { PagosBancoService } from './pagos-banco.service';
import { PagosBanco } from './entities/pagos-banco.entity';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';
import { SolicitudEstadoId } from '../solicitudes/constants/solicitud-estado.constants';

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
        'Carga completada: 1 pago registrado y 0 duplicados omitidos. Resultado: 1 solicitud pagada, 0 solicitudes observadas y 0 pagos pendientes reverificados.',
      );
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

    it('omits database and in-file duplicate vouchers', async () => {
      existingPayments = [{ numeroVoucher: 'V002' } as PagosBanco];

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
      const createDto = { dniCodigo: '12345678', numeroVoucher: ' V001 ' };
      mockPagosBancoRepository.create.mockReturnValue(mockPago);
      mockPagosBancoRepository.save.mockResolvedValue(mockPago);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          numeroVoucher: 'V001',
          verificado: false,
        }),
      );
      expect(result).toEqual(mockPago);
    });

    it('returns all payments ordered by creation date', async () => {
      mockPagosBancoRepository.find.mockResolvedValue([mockPago]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { creadoEn: 'DESC' },
      });
      expect(result).toEqual([mockPago]);
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
      mockPagosBancoRepository.findOne.mockResolvedValue(mockPago);
      mockPagosBancoRepository.save.mockResolvedValue({
        ...mockPago,
        alumno: 'Juan Updated',
      });

      const result = await service.update(1, { alumno: 'Juan Updated' });

      expect(repository.save).toHaveBeenCalled();
      expect(result.alumno).toBe('Juan Updated');
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
