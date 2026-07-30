import {
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Estado,
  EstadoReferencia,
} from 'src/modules/auxiliares/estados/entities/estado.entity';
import { Estudiante } from 'src/modules/principales/estudiantes/entities/estudiante.entity';
import { MailerService } from 'src/shared/mailer/mailer.service';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { SolicitudEstadoId } from './constants/solicitud-estado.constants';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { Solicitud } from './entities/solicitud.entity';
import { SolicitudesService } from './solicitudes.service';

describe('SolicitudesService', () => {
  let service: SolicitudesService;
  let solicitudRepository: jest.Mocked<Repository<Solicitud>>;
  let estadoRepository: jest.Mocked<Repository<Estado>>;
  let mailerService: jest.Mocked<MailerService>;
  let dataSource: { transaction: jest.Mock };
  let transactionManager: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  const estadoRechazado = {
    id: SolicitudEstadoId.RECHAZADO,
    nombre: 'RECHAZADO',
    referencia: EstadoReferencia.SOLICITUD,
  } as Estado;

  const buildSolicitud = (overrides: Partial<Solicitud> = {}): Solicitud =>
    ({
      id: 10,
      estadoId: 1,
      observaciones: null,
      modificadoEn: new Date('2026-01-01T00:00:00.000Z'),
      estudiante: {
        email: 'estudiante@ciunac.edu.pe',
      },
      ...overrides,
    }) as Solicitud;

  beforeEach(async () => {
    transactionManager = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn(
        async (callback: (manager: EntityManager) => Promise<unknown>) =>
          callback(transactionManager as unknown as EntityManager),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitudesService,
        {
          provide: getRepositoryToken(Solicitud),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Estado),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<SolicitudesService>(SolicitudesService);
    solicitudRepository = module.get(getRepositoryToken(Solicitud));
    estadoRepository = module.get(getRepositoryToken(Estado));
    mailerService = module.get(MailerService);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    const createDto = {
      estudianteId: 'student-1',
      tipoSolicitudId: 1,
      idiomaId: 3,
      nivelId: 2,
      estadoId: SolicitudEstadoId.NUEVO,
      periodo: '202607',
      manual: true,
    } as CreateSolicitudDto;

    it('returns 409 and does not create a duplicated manual solicitud', async () => {
      transactionManager.findOne
        .mockResolvedValueOnce({
          id: 'student-1',
          numeroDocumento: ' 12345678 ',
        } as Estudiante)
        .mockResolvedValueOnce(buildSolicitud({ id: 456 }));

      let conflict: ConflictException | undefined;
      try {
        await service.create(createDto);
      } catch (error) {
        conflict = error as ConflictException;
      }

      expect(conflict).toBeInstanceOf(ConflictException);
      expect(conflict?.getStatus()).toBe(409);
      expect(conflict?.getResponse()).toEqual({
        statusCode: 409,
        error: 'Conflict',
        code: 'SOLICITUD_MANUAL_DUPLICADA',
        message:
          'El estudiante ya tiene una solicitud pendiente para el mismo idioma y nivel',
        solicitudId: 456,
      });
      expect(transactionManager.findOne).toHaveBeenNthCalledWith(
        1,
        Estudiante,
        {
          where: { id: 'student-1' },
          lock: { mode: 'pessimistic_write' },
        },
      );
      expect(transactionManager.findOne).toHaveBeenNthCalledWith(
        2,
        Solicitud,
        {
          where: {
            estadoId: expect.objectContaining({
              _type: 'in',
              _value: [1, 2, 4],
            }),
            idiomaId: 3,
            nivelId: 2,
            estudiante: {
              numeroDocumento: '12345678',
            },
          },
        },
      );
      expect(transactionManager.create).not.toHaveBeenCalled();
      expect(transactionManager.save).not.toHaveBeenCalled();
      expect(solicitudRepository.create).not.toHaveBeenCalled();
      expect(solicitudRepository.save).not.toHaveBeenCalled();
    });

    it('creates a manual solicitud when no pending duplicate exists', async () => {
      const solicitud = buildSolicitud({
        estudianteId: 'student-1',
        idiomaId: 3,
        nivelId: 2,
        manual: true,
      });
      transactionManager.findOne
        .mockResolvedValueOnce({
          id: 'student-1',
          numeroDocumento: '12345678',
        } as Estudiante)
        .mockResolvedValueOnce(null);
      transactionManager.create.mockReturnValue(solicitud);
      transactionManager.save.mockResolvedValue(solicitud);

      await expect(service.create(createDto)).resolves.toBe(solicitud);

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(transactionManager.create).toHaveBeenCalledWith(
        Solicitud,
        createDto,
      );
      expect(transactionManager.save).toHaveBeenCalledWith(
        Solicitud,
        solicitud,
      );
    });

    it('uses the incoming language and level in the duplicate lookup', async () => {
      const differentCombinationDto = {
        ...createDto,
        idiomaId: 5,
        nivelId: 7,
      };
      const solicitud = buildSolicitud({ idiomaId: 5, nivelId: 7 });
      transactionManager.findOne
        .mockResolvedValueOnce({
          id: 'student-1',
          numeroDocumento: '12345678',
        } as Estudiante)
        .mockResolvedValueOnce(null);
      transactionManager.create.mockReturnValue(solicitud);
      transactionManager.save.mockResolvedValue(solicitud);

      await service.create(differentCombinationDto);

      expect(transactionManager.findOne).toHaveBeenNthCalledWith(
        2,
        Solicitud,
        expect.objectContaining({
          where: expect.objectContaining({
            idiomaId: 5,
            nivelId: 7,
          }),
        }),
      );
    });

    it('does not validate duplicates for a non-manual solicitud', async () => {
      const automaticDto = { ...createDto, manual: false };
      const solicitud = buildSolicitud({ manual: false });
      solicitudRepository.create.mockReturnValue(solicitud);
      solicitudRepository.save.mockResolvedValue(solicitud);

      await expect(service.create(automaticDto)).resolves.toBe(solicitud);

      expect(dataSource.transaction).not.toHaveBeenCalled();
      expect(solicitudRepository.create).toHaveBeenCalledWith(automaticDto);
      expect(solicitudRepository.save).toHaveBeenCalledWith(solicitud);
    });

    it('returns 404 when the manual solicitud student does not exist', async () => {
      transactionManager.findOne.mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(transactionManager.findOne).toHaveBeenCalledTimes(1);
      expect(transactionManager.create).not.toHaveBeenCalled();
      expect(transactionManager.save).not.toHaveBeenCalled();
    });
  });

  it('should reject a solicitud and send the notification', async () => {
    const solicitud = buildSolicitud();
    solicitudRepository.findOne.mockResolvedValue(solicitud);
    estadoRepository.findOne.mockResolvedValue(estadoRechazado);
    solicitudRepository.save.mockImplementation(async (item) => item);
    mailerService.sendMail.mockResolvedValue(undefined);

    const result = await service.reject(10, {
      observaciones: '  Voucher invalido  ',
    });

    expect(estadoRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: SolicitudEstadoId.RECHAZADO,
        referencia: EstadoReferencia.SOLICITUD,
      },
    });
    expect(solicitudRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        estadoId: SolicitudEstadoId.RECHAZADO,
        estado: estadoRechazado,
        observaciones: 'Voucher invalido',
      }),
    );
    expect(mailerService.sendMail).toHaveBeenCalledWith({
      type: 'SOLICITUD_RECHAZADA',
      email: 'estudiante@ciunac.edu.pe',
      motivo: 'Voucher invalido',
    });
    expect(result.notificacion).toEqual({ estado: 'ENVIADA' });
  });

  it('should throw NotFoundException when the solicitud does not exist', async () => {
    solicitudRepository.findOne.mockResolvedValue(null);

    await expect(
      service.reject(999, { observaciones: 'Motivo valido' }),
    ).rejects.toThrow(NotFoundException);

    expect(solicitudRepository.save).not.toHaveBeenCalled();
    expect(mailerService.sendMail).not.toHaveBeenCalled();
  });

  it('should be idempotent when the solicitud is already rejected', async () => {
    const solicitud = buildSolicitud({
      estadoId: SolicitudEstadoId.RECHAZADO,
      observaciones: 'Motivo original',
    });
    solicitudRepository.findOne.mockResolvedValue(solicitud);

    const result = await service.reject(10, {
      observaciones: 'Motivo nuevo',
    });

    expect(result).toEqual({
      solicitud,
      notificacion: {
        estado: 'NO_APLICA',
        motivo: 'YA_RECHAZADA',
      },
    });
    expect(estadoRepository.findOne).not.toHaveBeenCalled();
    expect(solicitudRepository.save).not.toHaveBeenCalled();
    expect(mailerService.sendMail).not.toHaveBeenCalled();
  });

  it('should fail before updating when rejected state is not configured', async () => {
    solicitudRepository.findOne.mockResolvedValue(buildSolicitud());
    estadoRepository.findOne.mockResolvedValue(null);

    await expect(
      service.reject(10, { observaciones: 'Motivo valido' }),
    ).rejects.toThrow(InternalServerErrorException);

    expect(solicitudRepository.save).not.toHaveBeenCalled();
    expect(mailerService.sendMail).not.toHaveBeenCalled();
  });

  it('should keep the rejection when the student has no email', async () => {
    const solicitud = buildSolicitud({
      estudiante: { email: '' } as never,
    });
    solicitudRepository.findOne.mockResolvedValue(solicitud);
    estadoRepository.findOne.mockResolvedValue(estadoRechazado);
    solicitudRepository.save.mockImplementation(async (item) => item);

    const result = await service.reject(10, {
      observaciones: 'Motivo valido',
    });

    expect(result.notificacion).toEqual({
      estado: 'NO_ENVIADA',
      motivo: 'ESTUDIANTE_SIN_EMAIL',
    });
    expect(solicitudRepository.save).toHaveBeenCalled();
    expect(mailerService.sendMail).not.toHaveBeenCalled();
  });

  it('should keep the rejection when sending the email fails', async () => {
    solicitudRepository.findOne.mockResolvedValue(buildSolicitud());
    estadoRepository.findOne.mockResolvedValue(estadoRechazado);
    solicitudRepository.save.mockImplementation(async (item) => item);
    mailerService.sendMail.mockRejectedValue(new Error('SMTP unavailable'));

    const result = await service.reject(10, {
      observaciones: 'Motivo valido',
    });

    expect(result.notificacion).toEqual({
      estado: 'NO_ENVIADA',
      motivo: 'ERROR_ENVIO',
    });
    expect(solicitudRepository.save).toHaveBeenCalled();
  });
});
