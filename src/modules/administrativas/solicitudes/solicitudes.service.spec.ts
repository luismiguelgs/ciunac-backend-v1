import {
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
import { MailerService } from 'src/shared/mailer/mailer.service';
import { Repository } from 'typeorm';
import { SolicitudEstadoId } from './constants/solicitud-estado.constants';
import { Solicitud } from './entities/solicitud.entity';
import { SolicitudesService } from './solicitudes.service';

describe('SolicitudesService', () => {
  let service: SolicitudesService;
  let solicitudRepository: jest.Mocked<Repository<Solicitud>>;
  let estadoRepository: jest.Mocked<Repository<Estado>>;
  let mailerService: jest.Mocked<MailerService>;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitudesService,
        {
          provide: getRepositoryToken(Solicitud),
          useValue: {
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
