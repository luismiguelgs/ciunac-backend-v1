import { INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Q10Controller } from '../src/q10/q10.controller';
import { Q10Service } from '../src/q10/q10.service';
import { EstudiantesService } from '../src/modules/principales/estudiantes/estudiantes.service';
import { DocentesService } from '../src/modules/principales/docentes/docentes.service';
import { GruposService } from '../src/modules/estructura/grupos/grupos.service';
import { CiclosService } from '../src/modules/estructura/ciclos/ciclos.service';
import {
  configureQ10Diagnostics,
  Q10ValidationPipe,
} from '../src/q10/q10-operation';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('Q10 registration diagnostic pipeline', () => {
  let app: INestApplication;
  let fetchMock: jest.SpyInstance;
  let warn: jest.SpyInstance;
  let error: jest.SpyInstance;
  const previousKey = process.env.API_KEY;
  const students = {
    validarFacultadYEscuela: jest.fn(),
    syncFromQ10: jest.fn(),
  };
  const payload = {
    Primer_nombre: 'PRIVATE-NAME',
    Primer_apellido: 'Test',
    Segundo_apellido: 'Test',
    Email: 'private@example.invalid',
    Numero_identificacion: '12345678',
    Codigo_tipo_identificacion: 'PE01',
    Genero: 'F',
    Fecha_nacimiento: '2000-01-01',
    Telefono: '999999999',
    Celular: '999999999',
    Codigo_programa: 'TEST',
  };
  const response = (data: unknown, status = 200): Response =>
    ({ ok: status < 400, status, json: async () => data }) as Response;

  beforeAll(async () => {
    process.env.API_KEY = 'test-only';
    const module = await Test.createTestingModule({
      controllers: [Q10Controller],
      providers: [
        Q10Service,
        { provide: EstudiantesService, useValue: students },
        ...[DocentesService, GruposService, CiclosService].map((provide) => ({
          provide,
          useValue: {},
        })),
      ],
    }).compile();
    app = module.createNestApplication();
    configureQ10Diagnostics(app);
    app.useGlobalPipes(
      new Q10ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });
  beforeEach(() => {
    students.validarFacultadYEscuela.mockReset().mockResolvedValue(undefined);
    students.syncFromQ10
      .mockReset()
      .mockResolvedValue({
        id: 'local-only',
        numeroDocumento: payload.Numero_identificacion,
      });
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('Unexpected network request'));
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    error = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => {
    await app.close();
    process.env.API_KEY = previousKey;
  });

  it.each([
    [
      'local',
      400,
      'Q10_LOCAL_VALIDATION_FAILED',
      'LOCAL_VALIDATION',
      'not_attempted',
      'not_attempted',
    ],
    [
      'period',
      502,
      'Q10_PERIOD_LOOKUP_FAILED',
      'PERIOD_LOOKUP',
      'not_attempted',
      'not_attempted',
    ],
    [
      'remote',
      400,
      'Q10_STUDENT_CREATION_REJECTED',
      'REMOTE_CREATE',
      'unknown',
      'not_attempted',
    ],
    [
      'conflict',
      409,
      'Q10_ID_CONFLICT',
      'LOCAL_SYNC',
      'confirmed',
      'not_attempted',
    ],
    [
      'database',
      502,
      'Q10_CREATED_LOCAL_SYNC_FAILED',
      'LOCAL_SYNC',
      'confirmed',
      'unknown',
    ],
    [
      'enrollment',
      502,
      'Q10_CREATED_PROGRAM_PENDING',
      'ENROLLMENT_LOOKUP',
      'confirmed',
      'confirmed',
    ],
    [
      'program',
      502,
      'Q10_CREATED_PROGRAM_PENDING',
      'PROGRAM_REGISTRATION',
      'confirmed',
      'confirmed',
    ],
  ])(
    'logs %s failures with safe effects',
    async (scenario, status, code, stage, remoteStudent, localStudent) => {
      if (scenario === 'local')
        students.validarFacultadYEscuela.mockRejectedValueOnce(
          new BadRequestException({
            code,
            message: 'La escuela indicada no existe',
            validationErrors: [
              { field: 'escuelaId', rules: ['SCHOOL_NOT_FOUND'] },
            ],
          }),
        );
      if (scenario !== 'period')
        fetchMock.mockResolvedValueOnce(
          response([{ Consecutivo: 1, Ordenamiento: 1 }]),
        );
      fetchMock.mockResolvedValueOnce(
        response(
          { Codigo_estudiante: 'PRIVATE-Q10', Message: 'PRIVATE-TEXT' },
          scenario === 'remote' ? 400 : 200,
        ),
      );
      if (scenario === 'conflict')
        students.syncFromQ10.mockRejectedValueOnce(
          new ConflictException({ code }),
        );
      if (scenario === 'database')
        students.syncFromQ10.mockRejectedValueOnce(new Error('PRIVATE-DB'));
      if (scenario === 'enrollment')
        fetchMock.mockResolvedValueOnce(response([]));
      if (scenario === 'program')
        fetchMock
          .mockResolvedValueOnce(response([{ Consecutivo_inscripcion: 2 }]))
          .mockResolvedValueOnce(response({ Message: 'PRIVATE-PROGRAM' }, 400));
      const res = await request(app.getHttpServer())
        .post('/q10/estudiantes')
        .set('x-api-key', 'test-only')
        .send(payload)
        .expect(Number(status));
      expect(res.body).toMatchObject({ code, stage, retryAllowed: false });
      const events = [...warn.mock.calls, ...error.mock.calls];
      expect(events).toHaveLength(1);
      expect(JSON.parse(events[0][0])).toMatchObject({
        code,
        stage,
        remoteStudent,
        localStudent,
        operationId: res.body.operationId,
        httpStatus: Number(status),
      });
      expect(JSON.stringify(events)).not.toMatch(
        /PRIVATE-|12345678|private@example/,
      );
      if (scenario === 'local') expect(fetchMock).not.toHaveBeenCalled();
      if (['remote', 'period', 'local'].includes(scenario))
        expect(students.syncFromQ10).not.toHaveBeenCalled();
    },
  );
});
