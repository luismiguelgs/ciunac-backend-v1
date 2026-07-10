import { getModelToken } from '@nestjs/mongoose';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Certificado,
  TipoCertificado,
} from 'src/modules/administrativas/certificados/schemas/certificado.schema';
import { Solicitud } from 'src/modules/administrativas/solicitudes/entities/solicitud.entity';
import { CertificadosrService } from './certificadosr.service';

describe('CertificadosrService', () => {
  let service: CertificadosrService;
  let exec: jest.Mock;
  let certificadoFind: jest.Mock;
  let select: jest.Mock;
  let sort: jest.Mock;
  let lean: jest.Mock;
  let solicitudFind: jest.Mock;

  beforeEach(async () => {
    exec = jest.fn();
    solicitudFind = jest.fn();
    lean = jest.fn().mockReturnValue({ exec });
    sort = jest.fn().mockReturnValue({ lean });
    select = jest.fn().mockReturnValue({ sort });
    certificadoFind = jest.fn().mockReturnValue({ select });
    const certificadoModel = {
      find: certificadoFind,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificadosrService,
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

    service = module.get<CertificadosrService>(CertificadosrService);
  });

  it('debe agrupar los certificados por nivel y formato', async () => {
    exec.mockResolvedValue([
      {
        numeroRegistro: 'REG-001',
        tipo: TipoCertificado.VIRTUAL,
        estudiante: 'Ana Torres',
        idioma: 'Inglés',
        nivel: 'Básico',
        solicitudId: 1,
        fechaEmision: new Date('2026-06-04T10:00:00.000Z'),
      },
      {
        numeroRegistro: 'REG-002',
        tipo: TipoCertificado.FISICO,
        estudiante: 'Luis Ramos',
        idioma: 'Portugués',
        nivel: 'BASICO',
        solicitudId: 999,
        fechaEmision: new Date('2026-06-03T10:00:00.000Z'),
      },
      {
        numeroRegistro: 'REG-003',
        tipo: TipoCertificado.VIRTUAL,
        estudiante: 'María León',
        idioma: 'Inglés',
        nivel: 'Intermedio',
        solicitudId: 3,
        fechaEmision: new Date('2026-06-02T10:00:00.000Z'),
      },
      {
        numeroRegistro: 'REG-004',
        tipo: TipoCertificado.FISICO,
        estudiante: 'José Paz',
        idioma: 'Inglés',
        nivel: 'Avanzado',
        solicitudId: 4,
        fechaEmision: new Date('2026-06-01T10:00:00.000Z'),
      },
    ]);
    solicitudFind.mockResolvedValue([
      { id: 1, periodo: '2026-I', numeroVoucher: 'V-001' },
      { id: 3, periodo: '2025-II', numeroVoucher: 'V-003' },
      { id: 4, periodo: '2025-I', numeroVoucher: 'V-004' },
    ]);

    await expect(service.findAll()).resolves.toEqual({
      basico: {
        digitales: [
          {
            numeroRegistro: 'REG-001',
            tipo: TipoCertificado.VIRTUAL,
            alumno: 'Ana Torres',
            idioma: 'Inglés',
            nivel: 'Básico',
            periodo: '2026-I',
            numeroVoucher: 'V-001',
          },
        ],
        fisicos: [
          {
            numeroRegistro: 'REG-002',
            tipo: TipoCertificado.FISICO,
            alumno: 'Luis Ramos',
            idioma: 'Portugués',
            nivel: 'BASICO',
            periodo: null,
            numeroVoucher: null,
          },
        ],
      },
      intermedioAvanzado: {
        digitales: [
          {
            numeroRegistro: 'REG-003',
            tipo: TipoCertificado.VIRTUAL,
            alumno: 'María León',
            idioma: 'Inglés',
            nivel: 'Intermedio',
            periodo: '2025-II',
            numeroVoucher: 'V-003',
          },
        ],
        fisicos: [
          {
            numeroRegistro: 'REG-004',
            tipo: TipoCertificado.FISICO,
            alumno: 'José Paz',
            idioma: 'Inglés',
            nivel: 'Avanzado',
            periodo: '2025-I',
            numeroVoucher: 'V-004',
          },
        ],
      },
    });
    expect(certificadoFind).toHaveBeenCalledWith({ impreso: false });
    expect(select).toHaveBeenCalledWith({
      numeroRegistro: 1,
      tipo: 1,
      estudiante: 1,
      idioma: 1,
      nivel: 1,
      solicitudId: 1,
      fechaEmision: 1,
    });
    expect(sort).toHaveBeenCalledWith({ fechaEmision: -1 });
    expect(lean).toHaveBeenCalledTimes(1);
    expect(solicitudFind).toHaveBeenCalledTimes(1);
  });

  it('debe excluir niveles y tipos no reconocidos', async () => {
    exec.mockResolvedValue([
      {
        numeroRegistro: 'REG-OTRO-NIVEL',
        tipo: TipoCertificado.FISICO,
        estudiante: 'Alumno Uno',
        idioma: 'Inglés',
        nivel: 'Experto',
        solicitudId: 10,
      },
      {
        numeroRegistro: 'REG-OTRO-TIPO',
        tipo: 'DESCONOCIDO',
        estudiante: 'Alumno Dos',
        idioma: 'Inglés',
        nivel: 'Básico',
        solicitudId: 11,
      },
    ]);
    solicitudFind.mockResolvedValue([]);

    await expect(service.findAll()).resolves.toEqual({
      basico: { digitales: [], fisicos: [] },
      intermedioAvanzado: { digitales: [], fisicos: [] },
    });
  });

  it('debe devolver los grupos vacíos sin consultar solicitudes', async () => {
    exec.mockResolvedValue([]);

    await expect(service.findAll()).resolves.toEqual({
      basico: { digitales: [], fisicos: [] },
      intermedioAvanzado: { digitales: [], fisicos: [] },
    });
    expect(solicitudFind).not.toHaveBeenCalled();
  });

  it('debe consultar solo IDs validos y sin duplicados', async () => {
    exec.mockResolvedValue([
      {
        numeroRegistro: 'REG-001',
        tipo: TipoCertificado.VIRTUAL,
        estudiante: 'Ana Torres',
        idioma: 'Ingles',
        nivel: 'Basico',
        solicitudId: '7',
      },
      {
        numeroRegistro: 'REG-002',
        tipo: TipoCertificado.FISICO,
        estudiante: 'Luis Ramos',
        idioma: 'Ingles',
        nivel: 'Intermedio',
        solicitudId: 7,
      },
      {
        numeroRegistro: 'REG-SIN-ID',
        tipo: TipoCertificado.FISICO,
        estudiante: 'Alumno sin ID',
        idioma: 'Ingles',
        nivel: 'Avanzado',
        solicitudId: 'invalido',
      },
    ]);
    solicitudFind.mockResolvedValue([
      { id: 7, periodo: '2026-I', numeroVoucher: 'V-007' },
    ]);

    const resultado = await service.findAll();

    expect(resultado.basico.digitales[0].periodo).toBe('2026-I');
    expect(resultado.basico.digitales[0].numeroVoucher).toBe('V-007');
    expect(resultado.intermedioAvanzado.fisicos[0].periodo).toBe('2026-I');
    expect(resultado.intermedioAvanzado.fisicos[0].numeroVoucher).toBe('V-007');
    expect(resultado.intermedioAvanzado.fisicos[1].periodo).toBeNull();
    expect(resultado.intermedioAvanzado.fisicos[1].numeroVoucher).toBeNull();
    expect(solicitudFind).toHaveBeenCalledWith({
      select: { id: true, periodo: true, numeroVoucher: true },
      where: {
        id: expect.objectContaining({
          _type: 'in',
          _value: [7],
        }),
      },
    });
  });
});
