import { getModelToken } from '@nestjs/mongoose';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Certificado } from 'src/modules/administrativas/certificados/schemas/certificado.schema';
import { Solicitud } from 'src/modules/administrativas/solicitudes/entities/solicitud.entity';
import { TiemposService } from './tiempos.service';

describe('TiemposService', () => {
  let service: TiemposService;
  let exec: jest.Mock;
  let certificadoFind: jest.Mock;
  let select: jest.Mock;
  let lean: jest.Mock;
  let solicitudFind: jest.Mock;

  beforeEach(async () => {
    exec = jest.fn();
    solicitudFind = jest.fn();
    lean = jest.fn().mockReturnValue({ exec });
    select = jest.fn().mockReturnValue({ lean });
    certificadoFind = jest.fn().mockReturnValue({ select });
    const certificadoModel = {
      find: certificadoFind,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TiemposService,
        {
          provide: getModelToken(Certificado.name),
          useValue: certificadoModel,
        },
        {
          provide: getRepositoryToken(Solicitud),
          useValue: { find: solicitudFind },
        },
      ],
    }).compile();

    service = module.get<TiemposService>(TiemposService);
  });

  it('debe calcular el tiempo transcurrido en horas', async () => {
    exec.mockResolvedValue([
      {
        _id: 'certificado-1',
        solicitudId: 10,
        fechaEmision: new Date('2026-06-02T18:30:00.000Z'),
      },
    ]);
    solicitudFind.mockResolvedValue([
      {
        id: 10,
        periodo: '2026-I',
        digital: true,
        creadoEn: new Date('2026-06-01T08:00:00.000Z'),
        tiposSolicitud: { solicitud: 'Certificado de estudios' },
      },
    ]);

    await expect(service.findAll()).resolves.toEqual([
      {
        certificadoId: 'certificado-1',
        solicitudId: 10,
        tipoSolicitud: 'Certificado de estudios',
        periodo: '2026-I',
        formatoCertificado: 'DIGITAL',
        fechaSolicitud: new Date('2026-06-01T08:00:00.000Z'),
        fechaEmision: new Date('2026-06-02T18:30:00.000Z'),
        tiempoHoras: 34.5,
      },
    ]);
    expect(certificadoFind).toHaveBeenCalledWith();
    expect(select).toHaveBeenCalledWith({
      _id: 1,
      solicitudId: 1,
      fechaEmision: 1,
    });
    expect(lean).toHaveBeenCalledTimes(1);
    expect(solicitudFind).toHaveBeenCalledWith({
      where: {
        id: expect.objectContaining({
          _type: 'in',
          _value: [10],
        }),
      },
      relations: { tiposSolicitud: true },
    });
  });

  it('debe devolver una lista vacía cuando no hay certificados', async () => {
    exec.mockResolvedValue([]);

    await expect(service.findAll()).resolves.toEqual([]);
    expect(solicitudFind).not.toHaveBeenCalled();
  });

  it('debe omitir certificados sin una solicitud relacionada', async () => {
    exec.mockResolvedValue([
      {
        _id: 'certificado-sin-solicitud',
        solicitudId: 99,
        fechaEmision: new Date('2026-06-02T18:30:00.000Z'),
      },
    ]);
    solicitudFind.mockResolvedValue([]);

    await expect(service.findAll()).resolves.toEqual([]);
  });

  it('debe ignorar identificadores invalidos y consultar IDs sin duplicados', async () => {
    exec.mockResolvedValue([
      {
        _id: 'certificado-invalido',
        solicitudId: 'sin-id',
        fechaEmision: new Date('2026-06-04T10:00:00.000Z'),
      },
      {
        _id: 'certificado-1',
        solicitudId: '10',
        fechaEmision: new Date('2026-06-02T10:00:00.000Z'),
      },
      {
        _id: 'certificado-2',
        solicitudId: 10,
        fechaEmision: new Date('2026-06-03T10:00:00.000Z'),
      },
    ]);
    solicitudFind.mockResolvedValue([
      {
        id: 10,
        periodo: '2026-I',
        digital: false,
        creadoEn: new Date('2026-06-01T08:00:00.000Z'),
        tiposSolicitud: { solicitud: 'Certificado fisico' },
      },
    ]);

    const resultado = await service.findAll();

    expect(resultado.map((item) => item.certificadoId)).toEqual([
      'certificado-2',
      'certificado-1',
    ]);
    expect(
      resultado.every((item) => item.formatoCertificado === 'FISICO'),
    ).toBe(true);
    expect(solicitudFind).toHaveBeenCalledWith({
      where: {
        id: expect.objectContaining({
          _type: 'in',
          _value: [10],
        }),
      },
      relations: { tiposSolicitud: true },
    });
  });

  it('debe omitir registros con fechas invalidas', async () => {
    exec.mockResolvedValue([
      {
        _id: 'certificado-fecha-invalida',
        solicitudId: 10,
        fechaEmision: 'fecha-invalida',
      },
    ]);
    solicitudFind.mockResolvedValue([
      {
        id: 10,
        periodo: '2026-I',
        digital: true,
        creadoEn: new Date('2026-06-01T08:00:00.000Z'),
        tiposSolicitud: { solicitud: 'Certificado de estudios' },
      },
    ]);

    await expect(service.findAll()).resolves.toEqual([]);
  });
});
