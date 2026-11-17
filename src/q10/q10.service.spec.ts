import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CiclosService } from 'src/modules/estructura/ciclos/ciclos.service';
import { GruposService } from 'src/modules/estructura/grupos/grupos.service';
import { DocentesService } from 'src/modules/principales/docentes/docentes.service';
import { Estudiante } from 'src/modules/principales/estudiantes/entities/estudiante.entity';
import { EstudiantesService } from 'src/modules/principales/estudiantes/estudiantes.service';
import { Q10EstudianteDto } from './dto/q10-estudiante.dto';
import { Q10Service } from './q10.service';

describe('Q10Service', () => {
  let service: Q10Service;
  let estudiantesService: {
    syncFromQ10: jest.Mock;
    validarFacultadYEscuela: jest.Mock;
  };
  let fetchMock: jest.SpiedFunction<typeof fetch>;
  let consoleError: jest.SpiedFunction<typeof console.error>;

  const request: Q10EstudianteDto = {
    Primer_nombre: 'Ana',
    Segundo_nombre: '',
    Primer_apellido: 'Perez',
    Segundo_apellido: 'Lopez',
    Email: 'ana@example.com',
    Codigo_tipo_identificacion: 'PE01',
    Numero_identificacion: '12345678',
    Genero: 'F',
    Fecha_nacimiento: '2000-01-01',
    Telefono: '014444444',
    Celular: '999999999',
    Direccion: 'Lima',
    Codigo_programa: 'INGLES',
  };

  const q10Response = {
    ...request,
    Codigo_estudiante: 'Q10-001',
  };

  const localStudent = {
    id: 'local-uuid',
    idQ10: q10Response.Codigo_estudiante,
    numeroDocumento: request.Numero_identificacion,
  } as Estudiante;

  const response = (data: unknown, ok = true): Response =>
    ({ ok, json: jest.fn().mockResolvedValue(data) }) as unknown as Response;

  const mockPeriod = (): void => {
    fetchMock.mockResolvedValueOnce(
      response([{ Consecutivo: 10, Ordenamiento: 1 }]),
    );
  };

  beforeEach(async () => {
    estudiantesService = {
      syncFromQ10: jest.fn(),
      validarFacultadYEscuela: jest.fn().mockResolvedValue(undefined),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Q10Service,
        { provide: EstudiantesService, useValue: estudiantesService },
        {
          provide: DocentesService,
          useValue: { findByIdentificacion: jest.fn() },
        },
        { provide: GruposService, useValue: { create: jest.fn() } },
        {
          provide: CiclosService,
          useValue: { findByCode: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<Q10Service>(Q10Service);
    fetchMock = jest.spyOn(global, 'fetch');
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    fetchMock.mockRestore();
    consoleError.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return only courses from the requested period', async () => {
    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue([
        { Codigo: 'A', Nombre_periodo: '2026-I' },
        { Codigo: 'B', Nombre_periodo: '2025-II' },
      ]),
    } as unknown as Response);

    await expect(service.listarHorariosCursos('2026-I')).resolves.toEqual([
      { Codigo: 'A', Nombre_periodo: '2026-I' },
    ]);
  });

  it('should translate course network errors into BadRequestException', async () => {
    fetchMock.mockRejectedValue(new Error('network unavailable'));

    await expect(service.listarHorariosCursos('2026-I')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('saves Codigo_estudiante locally and completes program registration', async () => {
    mockPeriod();
    fetchMock
      .mockResolvedValueOnce(response(q10Response))
      .mockResolvedValueOnce(response([{ Consecutivo_inscripcion: 20 }]))
      .mockResolvedValueOnce(response({ completed: true }));
    estudiantesService.syncFromQ10.mockResolvedValue(localStudent);

    await expect(service.crearEstudianteEnQ10(request)).resolves.toEqual({
      status: 'COMPLETED',
      estudiante: {
        id: localStudent.id,
        idQ10: q10Response.Codigo_estudiante,
        numeroDocumento: request.Numero_identificacion,
      },
      programaRegistrado: true,
    });
    expect(estudiantesService.syncFromQ10).toHaveBeenCalledWith(
      expect.objectContaining({
        idQ10: q10Response.Codigo_estudiante,
        numeroDocumento: request.Numero_identificacion,
      }),
    );
  });

  it.each([
    { facultadId: 3, escuelaId: 8 },
    { facultadId: 3 },
    { escuelaId: 8 },
    { facultadId: null, escuelaId: null },
    { tipoEstudiante: 'PRE' as const },
    { tipoEstudiante: 'POS' as const, escuelaId: 8 },
    { tipoEstudiante: 'PG' as const, facultadId: 3, escuelaId: 8 },
    { imgDoc: 'https://drive.google.com/file/d/documento/view' },
    {
      tipoEstudiante: 'PRE' as const,
      imgDoc: 'https://drive.google.com/file/d/documento/view',
      escuelaId: 8,
    },
    { tipoEstudiante: null, imgDoc: null },
  ])('keeps academic data local: %j', async (academicData) => {
    mockPeriod();
    fetchMock
      .mockResolvedValueOnce(response(q10Response))
      .mockResolvedValueOnce(response([{ Consecutivo_inscripcion: 20 }]))
      .mockResolvedValueOnce(response({ completed: true }));
    estudiantesService.syncFromQ10.mockResolvedValue(localStudent);

    await service.crearEstudianteEnQ10({ ...request, ...academicData });

    expect(estudiantesService.validarFacultadYEscuela).toHaveBeenCalledWith(
      expect.objectContaining({
        numeroDocumento: request.Numero_identificacion,
      }),
    );
    expect(estudiantesService.syncFromQ10).toHaveBeenCalledWith(
      expect.objectContaining(academicData),
    );
    for (const [, options] of fetchMock.mock.calls) {
      if (typeof options?.body === 'string') {
        const remotePayload = JSON.parse(options.body) as Record<
          string,
          unknown
        >;
        expect(remotePayload).not.toHaveProperty('facultadId');
        expect(remotePayload).not.toHaveProperty('escuelaId');
        expect(remotePayload).not.toHaveProperty('tipoEstudiante');
        expect(remotePayload).not.toHaveProperty('imgDoc');
      }
    }
    expect(
      estudiantesService.validarFacultadYEscuela.mock.invocationCallOrder[0],
    ).toBeLessThan(fetchMock.mock.invocationCallOrder[0]);
  });

  it.each([
    'La facultad indicada no existe',
    'La escuela indicada no existe',
    'La escuela indicada no pertenece a la facultad indicada',
    'El tipo de la escuela indicada no coincide con el tipo del estudiante',
    'La escuela indicada debe clasificarse como PRE o POS antes de registrar al estudiante',
  ])(
    'rejects invalid academic data before any Q10 call: %s',
    async (message) => {
      estudiantesService.validarFacultadYEscuela.mockRejectedValue(
        new BadRequestException(message),
      );

      const promise = service.crearEstudianteEnQ10({
        ...request,
        facultadId: 3,
        escuelaId: 8,
      });

      await expect(promise).rejects.toThrow(message);
      await expect(promise).rejects.toBeInstanceOf(BadRequestException);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(estudiantesService.syncFromQ10).not.toHaveBeenCalled();
    },
  );

  it('rejects a successful Q10 response without Codigo_estudiante', async () => {
    mockPeriod();
    fetchMock.mockResolvedValueOnce(
      response({ Numero_identificacion: '12345678' }),
    );

    const promise = service.crearEstudianteEnQ10(request);
    await expect(promise).rejects.toBeInstanceOf(BadGatewayException);
    await expect(promise).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'Q10_CREATED_INVALID_RESPONSE',
      }),
    });
  });

  it('reports a partial failure when local synchronization fails', async () => {
    mockPeriod();
    fetchMock.mockResolvedValueOnce(response(q10Response));
    estudiantesService.syncFromQ10.mockRejectedValue(
      new Error('database unavailable'),
    );

    await expect(service.crearEstudianteEnQ10(request)).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'Q10_CREATED_LOCAL_SYNC_FAILED',
        retryAllowed: false,
        idQ10: q10Response.Codigo_estudiante,
      }),
    });
  });

  it('reports Q10_UNAVAILABLE when student creation cannot reach Q10', async () => {
    mockPeriod();
    fetchMock.mockRejectedValueOnce(new Error('network unavailable'));
    await expect(service.crearEstudianteEnQ10(request)).rejects.toMatchObject({
      status: 502,
      response: {
        code: 'Q10_UNAVAILABLE',
        message: 'No fue posible comunicarse con Q10',
        retryAllowed: true,
      },
    });
    expect(estudiantesService.syncFromQ10).not.toHaveBeenCalled();
  });

  it('preserves a Q10 conflict as HTTP 409', async () => {
    mockPeriod();
    fetchMock.mockResolvedValueOnce(response(q10Response));
    estudiantesService.syncFromQ10.mockRejectedValue(
      new ConflictException({ code: 'Q10_ID_CONFLICT' }),
    );

    await expect(service.crearEstudianteEnQ10(request)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('reports program pending after the local student has been saved', async () => {
    mockPeriod();
    fetchMock
      .mockResolvedValueOnce(response(q10Response))
      .mockResolvedValueOnce(response([{ Consecutivo_inscripcion: 20 }]))
      .mockResolvedValueOnce(response({ message: 'rejected' }, false));
    estudiantesService.syncFromQ10.mockResolvedValue(localStudent);

    await expect(service.crearEstudianteEnQ10(request)).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'Q10_CREATED_PROGRAM_PENDING',
        retryAllowed: false,
        estudianteId: localStudent.id,
        idQ10: q10Response.Codigo_estudiante,
      }),
    });
    expect(estudiantesService.syncFromQ10).toHaveBeenCalledTimes(1);
  });
});
