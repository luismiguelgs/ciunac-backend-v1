import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Solicitud } from 'src/modules/administrativas/solicitudes/entities/solicitud.entity';
import { Detallesubicacion } from '../detallesubicacion/entities/detallesubicacion.entity';
import { Examenesubicacion } from '../examenesubicacion/entities/examenesubicacion.entity';
import { ActasexamenubicacionService } from './actasexamenubicacion.service';
import { ActaExamenUbicacion } from './schemas/actasexamenubicacion.schema';

const leanQuery = (value: unknown) => ({
  lean: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(value),
  }),
});

const findQuery = (value: unknown) => ({
  sort: jest.fn().mockReturnValue(leanQuery(value)),
});

const execQuery = (value: unknown) => ({
  exec: jest.fn().mockResolvedValue(value),
});

describe('ActasexamenubicacionService', () => {
  let service: ActasexamenubicacionService;
  let model: Record<string, jest.Mock>;
  let examenesRepository: Record<string, jest.Mock>;
  let detallesRepository: Record<string, jest.Mock>;
  let solicitudesRepository: Record<string, jest.Mock>;

  const estadoTerminado = {
    id: 8,
    nombre: 'TERMINADO',
  };

  const estadoActaGenerada = {
    id: 13,
    nombre: 'ACTA_GENERADA',
  };

  const examen = {
    id: 123,
    codigo: 'EU-2026-001',
    fecha: new Date('2026-07-06T10:00:00.000Z'),
    estadoId: estadoTerminado.id,
    estado: estadoTerminado,
    idiomaId: 1,
    idioma: { id: 1, nombre: 'Ingl?s' },
    docente: { id: 'doc-1', nombres: 'Ana', apellidos: 'P?rez' },
    aula: {
      id: 4,
      nombre: 'A-201',
      tipo: 'FISICA',
      ubicacion: 'Pabell?n A',
    },
    modificadoEn: new Date('2026-07-01T00:00:00.000Z'),
  } as unknown as Examenesubicacion;

  const detalle = {
    id: 77,
    solicitudId: 9001,
    idiomaId: 1,
    nivelId: 3,
    examenId: examen.id,
    estudianteId: 'est-1',
    nota: 84,
    calificacionId: 8,
    terminado: true,
    activo: true,
    estudiante: {
      id: 'est-1',
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678',
      nombres: 'Luis',
      apellidos: 'Quispe',
    },
    nivel: { id: 3, nombre: 'Intermedio' },
    calificacion: {
      id: 8,
      ciclo: { id: 12, nombre: 'Intermedio 2', codigo: 'I2' },
    },
  } as unknown as Detallesubicacion;

  const solicitud = {
    id: 9001,
    estudianteId: 'est-1',
    tipoSolicitudId: 7,
    idiomaId: 1,
    estadoId: 3,
    numeroVoucher: 'V-2026-100',
  } as Solicitud;

  const objectId = new Types.ObjectId();
  const actaObject = {
    _id: objectId,
    examenId: examen.id,
    codigo: examen.codigo,
  };
  const actaDocument = {
    ...actaObject,
    toObject: jest.fn().mockReturnValue(actaObject),
  };

  beforeEach(async () => {
    model = {
      init: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockReturnValue(leanQuery(null)),
      find: jest.fn().mockReturnValue(findQuery([])),
      findById: jest.fn().mockReturnValue(leanQuery(null)),
      create: jest.fn().mockResolvedValue(actaDocument),
      deleteOne: jest.fn().mockReturnValue(execQuery({ deletedCount: 1 })),
    };

    examenesRepository = {
      findOne: jest.fn().mockResolvedValue({ ...examen }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    detallesRepository = {
      find: jest.fn().mockResolvedValue([detalle]),
    };
    solicitudesRepository = {
      find: jest.fn().mockResolvedValue([solicitud]),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActasexamenubicacionService,
        {
          provide: getModelToken(ActaExamenUbicacion.name),
          useValue: model,
        },
        {
          provide: getRepositoryToken(Examenesubicacion),
          useValue: examenesRepository,
        },
        {
          provide: getRepositoryToken(Detallesubicacion),
          useValue: detallesRepository,
        },
        {
          provide: getRepositoryToken(Solicitud),
          useValue: solicitudesRepository,
        },
      ],
    }).compile();

    service = module.get<ActasexamenubicacionService>(
      ActasexamenubicacionService,
    );
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('initializes the MongoDB index', async () => {
    await service.onModuleInit();
    expect(model.init).toHaveBeenCalled();
  });

  it('creates an acta without cronograma and updates the numeric estadoId', async () => {
    const result = await service.create(
      { examenId: examen.id },
      {
        usuarioId: 'user-1',
        email: 'admin@ciunac.edu.pe',
        rol: 'ADMINISTRATIVO',
      },
    );

    expect(result.id).toBe(objectId.toString());
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        examenId: examen.id,
        participantes: [
          expect.objectContaining({
            solicitudId: solicitud.id,
            numeroVoucher: solicitud.numeroVoucher,
          }),
        ],
      }),
    );
    expect(model.create).toHaveBeenCalledWith(
      expect.not.objectContaining({ cronograma: expect.anything() }),
    );
    expect(examenesRepository.update).toHaveBeenCalledWith(
      examen.id,
      expect.objectContaining({
        estadoId: estadoActaGenerada.id,
        actaId: objectId.toString(),
      }),
    );
  });

  it('rejects an already generated acta', async () => {
    model.findOne.mockReturnValue(leanQuery(actaObject));

    await expect(
      service.create(
        { examenId: examen.id },
        {
          usuarioId: 'user-1',
          email: 'admin@ciunac.edu.pe',
          rol: 'ADMINISTRATIVO',
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'ACTA_YA_EXISTE' }),
    });
  });

  it('returns 404 when the examen does not exist', async () => {
    examenesRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        { examenId: 999 },
        {
          usuarioId: 'user-1',
          email: 'admin@ciunac.edu.pe',
          rol: 'ADMINISTRATIVO',
        },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects an examen that is not TERMINADO', async () => {
    examenesRepository.findOne.mockResolvedValue({ ...examen, estadoId: 9 });

    await expect(
      service.create(
        { examenId: examen.id },
        {
          usuarioId: 'user-1',
          email: 'admin@ciunac.edu.pe',
          rol: 'ADMINISTRATIVO',
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'EXAMEN_NO_CERRADO' }),
    });
  });

  it('rejects an examen without active participants', async () => {
    detallesRepository.find.mockResolvedValue([]);

    await expect(
      service.create(
        { examenId: examen.id },
        {
          usuarioId: 'user-1',
          email: 'admin@ciunac.edu.pe',
          rol: 'ADMINISTRATIVO',
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'PARTICIPANTES_INCOMPLETOS' }),
    });
  });

  it('rejects a participant without voucher', async () => {
    solicitudesRepository.find.mockResolvedValue([
      { ...solicitud, numeroVoucher: '' },
    ]);

    await expect(
      service.create(
        { examenId: examen.id },
        {
          usuarioId: 'user-1',
          email: 'admin@ciunac.edu.pe',
          rol: 'ADMINISTRATIVO',
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'PARTICIPANTES_INCOMPLETOS',
      }),
    });
    expect(model.create).not.toHaveBeenCalled();
  });

  it('rejects a participant with an intermediate PAGADO solicitud', async () => {
    solicitudesRepository.find.mockResolvedValue([{ ...solicitud, estadoId: 4 }]);

    await expect(
      service.create(
        { examenId: examen.id },
        {
          usuarioId: 'user-1',
          email: 'admin@ciunac.edu.pe',
          rol: 'ADMINISTRATIVO',
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'PARTICIPANTES_INCOMPLETOS',
        detalles: [
          expect.objectContaining({
            detalleId: detalle.id,
            motivo: 'SOLICITUD_NO_VALIDADA',
          }),
        ],
      }),
    });
    expect(model.create).not.toHaveBeenCalled();
  });

  it('compensates MongoDB when updating PostgreSQL fails', async () => {
    examenesRepository.update.mockRejectedValue(new Error('postgres down'));

    await expect(
      service.create(
        { examenId: examen.id },
        {
          usuarioId: 'user-1',
          email: 'admin@ciunac.edu.pe',
          rol: 'ADMINISTRATIVO',
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'ERROR_PERSISTENCIA_ACTA' }),
    });
    expect(model.deleteOne).toHaveBeenCalledWith({ _id: objectId });
  });

  it('normalizes a duplicate key race to ACTA_YA_EXISTE', async () => {
    model.findOne
      .mockReturnValueOnce(leanQuery(null))
      .mockReturnValueOnce(leanQuery(actaObject));
    model.create.mockRejectedValue({ code: 11000 });

    await expect(
      service.create(
        { examenId: examen.id },
        {
          usuarioId: 'user-1',
          email: 'admin@ciunac.edu.pe',
          rol: 'ADMINISTRATIVO',
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'ACTA_YA_EXISTE' }),
    });
  });

  it('rejects an invalid MongoDB id', async () => {
    await expect(service.findOne('invalid')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns 404 for an unknown MongoDB id', async () => {
    await expect(service.findOne(objectId.toString())).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns legacy documents from findAll', async () => {
    model.find.mockReturnValue(
      findQuery([{ _id: objectId, codigo: 'LEGACY-001' }]),
    );

    const result = await service.findAll();

    expect(result).toEqual([
      expect.objectContaining({
        id: objectId.toString(),
        codigo: 'LEGACY-001',
      }),
    ]);
  });

  it('rejects update and delete because actas are immutable', () => {
    expect(() => service.update(objectId.toString(), {})).toThrow(
      ConflictException,
    );
    expect(() => service.remove(objectId.toString())).toThrow(
      ConflictException,
    );
  });
});
