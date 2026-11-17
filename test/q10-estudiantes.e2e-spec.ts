import {
  BadGatewayException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { Q10Controller } from '../src/q10/q10.controller';
import { Q10Service } from '../src/q10/q10.service';
import { createSwaggerDocument } from '../src/config/swagger.config';

describe('Q10 student registration (e2e)', () => {
  let app: INestApplication<App>;
  let q10Service: { crearEstudianteEnQ10: jest.Mock };
  const previousApiKey = process.env.API_KEY;

  const payload = {
    Primer_nombre: 'Ana',
    Primer_apellido: 'Perez',
    Segundo_apellido: 'Lopez',
    Email: 'ana@example.com',
    Codigo_tipo_identificacion: 'PE01',
    Numero_identificacion: '12345678',
    Genero: 'F',
    Fecha_nacimiento: '2000-01-01',
    Telefono: '014444444',
    Celular: '999999999',
    Codigo_programa: 'INGLES',
  };

  beforeAll(async () => {
    process.env.API_KEY = 'test-api-key';
    q10Service = {
      crearEstudianteEnQ10: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [Q10Controller],
      providers: [{ provide: Q10Service, useValue: q10Service }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    process.env.API_KEY = previousApiKey;
  });

  beforeEach(() => {
    q10Service.crearEstudianteEnQ10.mockReset();
    q10Service.crearEstudianteEnQ10.mockResolvedValue({
      status: 'COMPLETED',
      estudiante: {
        id: 'c65ee499-6495-46ee-83c2-17785423fbaf',
        idQ10: 'Q10-001',
        numeroDocumento: payload.Numero_identificacion,
      },
      programaRegistrado: true,
    });
  });

  it.each([
    { facultadId: 3, escuelaId: 8 },
    { facultadId: 3 },
    { escuelaId: 8 },
    { facultadId: null, escuelaId: null },
    { tipoEstudiante: 'PRE' },
    { tipoEstudiante: 'POS' },
    { tipoEstudiante: 'PG', facultadId: 3, escuelaId: 8 },
    { imgDoc: 'https://drive.google.com/file/d/documento/view' },
    { tipoEstudiante: 'PRE', imgDoc: 'http://example.com/documento.pdf' },
    { tipoEstudiante: null, imgDoc: null },
  ])('accepts optional local academic fields: %j', async (academicData) => {
    await request(app.getHttpServer())
      .post('/q10/estudiantes')
      .set('x-api-key', 'test-api-key')
      .send({ ...payload, ...academicData })
      .expect(201);

    expect(q10Service.crearEstudianteEnQ10).toHaveBeenCalledWith(
      expect.objectContaining(academicData),
    );
  });

  it.each([
    { facultadId: 0 },
    { facultadId: -1 },
    { facultadId: 1.5 },
    { facultadId: 'invalid' },
    { escuelaId: 0 },
    { escuelaId: -1 },
    { escuelaId: 1.5 },
    { escuelaId: 'invalid' },
    { tipoEstudiante: 'OTRO' },
    { tipoEstudiante: '' },
    { imgDoc: '' },
    { imgDoc: '   ' },
    { imgDoc: 'not-a-url' },
    { imgDoc: 'ftp://example.com/documento.pdf' },
    { imgDoc: 'javascript:alert(1)' },
    { imgDoc: 'drive.google.com/file/d/documento/view' },
  ])(
    'rejects invalid academic IDs at the HTTP boundary: %j',
    async (academicData) => {
      await request(app.getHttpServer())
        .post('/q10/estudiantes')
        .set('x-api-key', 'test-api-key')
        .send({ ...payload, ...academicData })
        .expect(400);

      expect(q10Service.crearEstudianteEnQ10).not.toHaveBeenCalled();
    },
  );

  it('documents local academic IDs and a complete request in Swagger', () => {
    const document = createSwaggerDocument(app);
    const schema = document.components?.schemas?.Q10EstudianteDto;

    expect(schema).toMatchObject({
      properties: {
        facultadId: { type: 'integer', minimum: 1, nullable: true, example: 3 },
        escuelaId: { type: 'integer', minimum: 1, nullable: true, example: 8 },
        tipoEstudiante: {
          type: 'string',
          nullable: true,
          enum: ['PRE', 'POS', 'PG', null],
        },
        imgDoc: { type: 'string', nullable: true, format: 'uri' },
      },
    });
    const operation = document.paths['/q10/estudiantes'].post;
    expect(operation?.requestBody).toMatchObject({
      content: {
        'application/json': {
          examples: {
            conDatosAcademicosLocales: {
              value: {
                Primer_nombre: 'Ana',
                Codigo_programa: 'INGLES',
                facultadId: 3,
                escuelaId: 8,
              },
            },
          },
        },
      },
    });
    expect(operation?.responses).toHaveProperty('400');
  });

  it('POST /q10/estudiantes returns the local and Q10 identifiers', async () => {
    q10Service.crearEstudianteEnQ10.mockResolvedValue({
      status: 'COMPLETED',
      estudiante: {
        id: 'c65ee499-6495-46ee-83c2-17785423fbaf',
        idQ10: 'Q10-001',
        numeroDocumento: payload.Numero_identificacion,
      },
      programaRegistrado: true,
    });

    await request(app.getHttpServer())
      .post('/q10/estudiantes')
      .set('x-api-key', 'test-api-key')
      .send(payload)
      .expect(201)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          status: 'COMPLETED',
          estudiante: {
            idQ10: 'Q10-001',
            numeroDocumento: payload.Numero_identificacion,
          },
          programaRegistrado: true,
        });
      });
  });

  it('does not accept Codigo_estudiante from the client', async () => {
    await request(app.getHttpServer())
      .post('/q10/estudiantes')
      .set('x-api-key', 'test-api-key')
      .send({ ...payload, Codigo_estudiante: 'CLIENT-VALUE' })
      .expect(400);
  });

  it('propagates a controlled partial failure', async () => {
    q10Service.crearEstudianteEnQ10.mockRejectedValueOnce(
      new BadGatewayException({
        code: 'Q10_CREATED_PROGRAM_PENDING',
        message: 'El estudiante fue creado, pero la matricula esta pendiente.',
        retryAllowed: false,
        estudianteId: 'c65ee499-6495-46ee-83c2-17785423fbaf',
        idQ10: 'Q10-001',
      }),
    );

    await request(app.getHttpServer())
      .post('/q10/estudiantes')
      .set('x-api-key', 'test-api-key')
      .send(payload)
      .expect(502)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          code: 'Q10_CREATED_PROGRAM_PENDING',
          message: 'El estudiante fue creado, pero la matricula esta pendiente.',
          retryAllowed: false,
        });
      });
  });

  it('rejects requests without API key', async () => {
    await request(app.getHttpServer())
      .post('/q10/estudiantes')
      .send(payload)
      .expect(401);
  });
});
