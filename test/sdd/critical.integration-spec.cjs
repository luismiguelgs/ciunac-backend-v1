const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const bcrypt = require('bcrypt');
const Ajv = require('ajv');
const { Test } = require('@nestjs/testing');
const { ValidationPipe } = require('@nestjs/common');
const request = require('supertest');
const { JwtService } = require('@nestjs/jwt');
const { ConfigService } = require('@nestjs/config');
const { databases, load } = require('./database.cjs');
const { absolute } = require('../../scripts/sdd/source.cjs');
let db;
let base;
let solicitudes;
let pagos;
let estudiantes;
const mailer = { sendMail: jest.fn(), sendPasswordReset: jest.fn() };
const service = (file, name, ...args) => new (load(file)[name])(...args);
const moduleFile = (domain, name) =>
  `src/modules/${domain}/${name}/${name}.service.ts`;
const csv = (...rows) =>
  Buffer.from(['n_voucher;monto;fecha_efectiva', ...rows].join('\n'));

function assertContract(operationId, value) {
  const document = JSON.parse(
    fs.readFileSync(absolute('docs/api/openapi.json'), 'utf8'),
  );
  const operation = Object.values(document.paths)
    .flatMap(Object.values)
    .find((item) => item.operationId === operationId);
  const response = Object.entries(operation.responses).find(([status]) =>
    status.startsWith('2'),
  )[1];
  const schema = JSON.parse(
    JSON.stringify(response.content['application/json'].schema).replace(
      /"#\/components/g,
      '"ciunac#/components',
    ),
  );
  const ajv = new Ajv({
    nullable: true,
    allErrors: true,
    unknownFormats: 'ignore',
    logger: false,
  });
  ajv.addSchema({ $id: 'ciunac', components: document.components });
  const validate = ajv.compile(schema);
  expect({
    operationId,
    errors: validate(JSON.parse(JSON.stringify(value)))
      ? null
      : validate.errors,
  }).toEqual({ operationId, errors: null });
}

beforeAll(async () => {
  db = await databases();
  const idioma = await db.seed('Idioma');
  const nivel = await db.seed('Nivel', { idiomaId: idioma.id });
  const ciclo = await db.seed('Ciclo', {
    idiomaId: idioma.id,
    nivelId: nivel.id,
  });
  const aula = await db.seed('Aula', { tipo: 'FISICA' });
  const docente = await db.seed('Docente', {
    genero: 'F',
    numeroDocumento: '87654321',
  });
  const estudiante = await db.seed('Estudiante', {
    genero: 'F',
    numeroDocumento: '12345678',
    tipoDocumento: 'DNI',
    email: 'alumna@example.invalid',
  });
  const modulo = await db.seed('Modulo', { nombre: '2026-10', activo: true });
  for (const id of [1, 2, 3, 4, 5, 12])
    await db.seed('Estado', {
      id,
      nombre: `SOL-${id}`,
      referencia: 'SOLICITUD',
    });
  for (const id of [8, 13])
    await db.seed('Estado', {
      id,
      nombre: id === 8 ? 'TERMINADO' : 'ACTA_GENERADA',
      referencia: 'EXAMEN_UBICACION',
    });
  await db.seed('Tipossolicitud', { id: 1 });
  await db.seed('Tipossolicitud', { id: 7 });
  base = { idioma, nivel, ciclo, aula, docente, estudiante, modulo };
  solicitudes = service(
    moduleFile('administrativas', 'solicitudes'),
    'SolicitudesService',
    db.repo('Solicitud'),
    db.repo('Estado'),
    mailer,
    db.pg,
  );
  pagos = service(
    moduleFile('administrativas', 'pagos-banco'),
    'PagosBancoService',
    db.repo('PagosBanco'),
    db.pg,
  );
  estudiantes = service(
    moduleFile('principales', 'estudiantes'),
    'EstudiantesService',
    db.repo('Estudiante'),
    db.repo('Facultad'),
    db.repo('Escuela'),
  );
}, 120000);

afterAll(async () => {
  if (db?.mongo) await db.mongo.close();
  if (db?.pg.isInitialized) await db.pg.destroy();
});
beforeEach(() => {
  jest.clearAllMocks();
  mailer.sendMail.mockResolvedValue(undefined);
  mailer.sendPasswordReset.mockResolvedValue(undefined);
});

async function solicitud(overrides = {}) {
  return db.seed('Solicitud', {
    estudianteId: base.estudiante.id,
    idiomaId: base.idioma.id,
    nivelId: base.nivel.id,
    tipoSolicitudId: 1,
    estadoId: 1,
    periodo: '2026-10',
    pago: 50,
    fechaPago: new Date('2026-10-01T00:00:00Z'),
    numeroVoucher: `V-${Date.now()}-${Math.random()}`,
    ...overrides,
  });
}

async function createEstudiantesApp() {
  const { EstudiantesController } = load(
    'src/modules/principales/estudiantes/estudiantes.controller.ts',
  );
  const { EstudiantesService } = load(
    'src/modules/principales/estudiantes/estudiantes.service.ts',
  );
  const module = await Test.createTestingModule({
    controllers: [EstudiantesController],
    providers: [{ provide: EstudiantesService, useValue: estudiantes }],
  }).compile();
  const app = module.createNestApplication({ logger: false });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();
  return app;
}

test('INT estudiante local valida POST PATCH y persiste fecha calendario por HTTP', async () => {
  const previousApiKey = process.env.API_KEY;
  process.env.API_KEY = 'sdd-local-student-test-only';
  const app = await createEstudiantesApp();
  try {
    const payload = {
      nombres: 'Ana',
      apellidos: 'Calendario',
      genero: 'F',
      fechaNacimiento: '2000-01-01',
      tipoDocumento: 'DNI',
      numeroDocumento: 'DOB-HTTP-1',
      celular: '999999999',
      tipoEstudiante: 'PG',
      imgDoc: 'https://example.invalid/dni.pdf',
    };
    const response = await request(app.getHttpServer())
      .post('/estudiantes')
      .set('x-api-key', process.env.API_KEY)
      .send(payload)
      .expect(201);
    assertContract('EstudiantesController_create', response.body);
    const id = response.body.id;
    const queried = await request(app.getHttpServer())
      .get(`/estudiantes/${id}`)
      .set('x-api-key', process.env.API_KEY)
      .expect(200);
    assertContract('EstudiantesController_findOne', queried.body);
    expect(queried.body).toMatchObject({
      fechaNacimiento: '2000-01-01',
      facultad: null,
      escuela: null,
    });
    const listed = await request(app.getHttpServer())
      .get('/estudiantes')
      .set('x-api-key', process.env.API_KEY)
      .expect(200);
    assertContract('EstudiantesController_findAll', listed.body);
    expect(await estudiantes.findOne(id)).toMatchObject({
      fechaNacimiento: '2000-01-01',
      tipoEstudiante: 'PG',
      imgDoc: payload.imgDoc,
    });
    const patched = await request(app.getHttpServer())
      .patch(`/estudiantes/${id}`)
      .set('x-api-key', process.env.API_KEY)
      .send({ fechaNacimiento: '2004-02-29' })
      .expect(200);
    assertContract('EstudiantesController_update', patched.body);
    await request(app.getHttpServer())
      .patch(`/estudiantes/${id}`)
      .set('x-api-key', process.env.API_KEY)
      .send({ nombres: 'Ana Actualizada' })
      .expect(200);
    for (const date of [
      '2001-02-29',
      '2000-02-30',
      '2000-01-01T00:00:00Z',
      null,
    ]) {
      await request(app.getHttpServer())
        .patch(`/estudiantes/${id}`)
        .set('x-api-key', process.env.API_KEY)
        .send({ fechaNacimiento: date })
        .expect(400);
    }
    expect(await estudiantes.findOne(id)).toMatchObject({
      fechaNacimiento: '2004-02-29',
      nombres: 'Ana Actualizada',
    });
    const { fechaNacimiento, ...withoutDate } = payload;
    await request(app.getHttpServer())
      .post('/estudiantes')
      .set('x-api-key', process.env.API_KEY)
      .send({ ...withoutDate, numeroDocumento: 'DOB-MISSING' })
      .expect(400);
    expect(
      await db.repo('Estudiante').countBy({ numeroDocumento: 'DOB-MISSING' }),
    ).toBe(0);
    await request(app.getHttpServer())
      .post('/estudiantes')
      .send(payload)
      .expect(401);
  } finally {
    await app.close();
    if (previousApiKey === undefined) delete process.env.API_KEY;
    else process.env.API_KEY = previousApiKey;
  }
});

test('INT estudiantes pagina filtra y proyecta el listado por HTTP', async () => {
  const previousApiKey = process.env.API_KEY;
  process.env.API_KEY = 'sdd-student-list-test-only';
  const app = await createEstudiantesApp();
  const list = (query = {}) =>
    request(app.getHttpServer())
      .get('/estudiantes')
      .query(query)
      .set('x-api-key', process.env.API_KEY);
  try {
    const facultad = await db.seed('Facultad', { nombre: 'Facultad SDD' });
    const otraFacultad = await db.seed('Facultad');
    const escuela = await db.seed('Escuela', {
      facultadId: facultad.id,
      nombre: 'Escuela SDD',
    });
    const otraEscuela = await db.seed('Escuela', { facultadId: facultad.id });
    const usuario = await db.seed('Usuario', {
      email: 'listado-usuario@example.invalid',
      password: 'hash-privado',
      refreshTokenHash: 'refresh-privado',
    });
    const lote = {
      nombres: 'Ana',
      apellidos: 'Aaa Paginacion',
      tipoDocumento: 'DNI',
      tipoEstudiante: 'PRE',
      facultadId: facultad.id,
      escuelaId: escuela.id,
      imgDoc: 'https://example.invalid/privado.pdf',
    };
    const primero = await db.seed('Estudiante', {
      ...lote,
      id: '00000000-0000-4000-8000-000000000001',
      numeroDocumento: '00009101',
      codigo: 'LIST%_!01',
      email: 'Paginacion-Ana@example.invalid',
      idQ10: 'Q10-PAG-1',
      usuario,
    });
    const segundo = await db.seed('Estudiante', {
      ...lote,
      id: '00000000-0000-4000-8000-000000000002',
      numeroDocumento: '00009102',
      codigo: 'LISTABC02',
      idQ10: 'Q10-PAG-2',
    });
    const sinTipo = await db.seed('Estudiante', {
      ...lote,
      numeroDocumento: '00009103',
      tipoEstudiante: null,
      idQ10: '   ',
    });
    const fueraDeEscuela = await db.seed('Estudiante', {
      ...lote,
      numeroDocumento: '00009104',
      escuelaId: otraEscuela.id,
      idQ10: 'Q10-PAG-4',
    });
    await db.seed('Estudiante', {
      ...lote,
      numeroDocumento: '00009105',
      facultadId: otraFacultad.id,
      escuelaId: null,
      idQ10: 'Q10-PAG-5',
    });
    await db.seed('Estudiante', {
      ...lote,
      numeroDocumento: '00009106',
      idQ10: null,
    });
    for (let index = 0; index < 25; index++) {
      await db.seed('Estudiante', {
        nombres: 'Extra',
        apellidos: 'Zzz Paginacion',
        numeroDocumento: `PAG-${index}`,
      });
    }

    const total = await db.repo('Estudiante').count();
    const defaults = (await list().expect(200)).body;
    assertContract('EstudiantesController_findAll', defaults);
    expect(defaults.meta).toEqual({
      page: 1,
      limit: 25,
      total,
      totalPages: Math.ceil(total / 25),
    });
    expect(defaults.data).toHaveLength(25);
    const max = (await list({ search: '   ', limit: 100 }).expect(200)).body;
    expect(max.meta).toEqual({ page: 1, limit: 100, total, totalPages: 1 });
    expect(max.data).toHaveLength(total);

    const filtros = {
      search: '  aNa AaA  ',
      tipoEstudiante: 'PRE',
      facultadId: facultad.id,
      escuelaId: escuela.id,
      vinculadoQ10: 'true',
      limit: 1,
    };
    const page1 = (await list(filtros).expect(200)).body;
    const page2 = (await list({ ...filtros, page: 2 }).expect(200)).body;
    expect(page1.meta).toEqual({ page: 1, limit: 1, total: 2, totalPages: 2 });
    expect(page2.meta).toEqual({ page: 2, limit: 1, total: 2, totalPages: 2 });
    expect(page1.data).toEqual([
      {
        id: primero.id,
        nombres: lote.nombres,
        apellidos: lote.apellidos,
        tipoDocumento: 'DNI',
        numeroDocumento: '00009101',
        codigo: 'LIST%_!01',
        tipoEstudiante: 'PRE',
        idQ10: 'Q10-PAG-1',
        facultadId: facultad.id,
        escuelaId: escuela.id,
        facultad: { id: facultad.id, nombre: facultad.nombre },
        escuela: { id: escuela.id, nombre: escuela.nombre },
      },
    ]);
    expect(page2.data.map((row) => row.id)).toEqual([segundo.id]);
    const outOfRange = (await list({ ...filtros, page: 999 }).expect(200)).body;
    expect(outOfRange).toEqual({
      data: [],
      meta: { page: 999, limit: 1, total: 2, totalPages: 2 },
    });
    const empty = (
      await list({ search: 'imposible-de-coincidir-sdd' }).expect(200)
    ).body;
    expect(empty).toEqual({
      data: [],
      meta: { page: 1, limit: 25, total: 0, totalPages: 0 },
    });

    for (const search of ['00009101', 'list%_!', 'paginacion-ANA@']) {
      const result = (await list({ search }).expect(200)).body;
      expect(result.data.map((row) => row.id)).toEqual([primero.id]);
    }
    const unclassified = (
      await list({
        search: '000091',
        tipoEstudiante: 'SIN_CLASIFICAR',
        vinculadoQ10: 'false',
      }).expect(200)
    ).body;
    expect(unclassified.data).toMatchObject([
      { id: sinTipo.id, idQ10: null, tipoEstudiante: null },
    ]);
    const bySchool = (await list({ escuelaId: otraEscuela.id }).expect(200))
      .body;
    expect(bySchool.data.map((row) => row.id)).toEqual([fueraDeEscuela.id]);

    for (const invalid of [
      { page: 0 },
      { page: 1.5 },
      { page: 'wrong' },
      { limit: 0 },
      { limit: 101 },
      { page: [1, 2] },
      { tipoEstudiante: 'OTRO' },
      { vinculadoQ10: '1' },
      { facultadId: 0 },
      { escuelaId: '2147483648' },
      { inesperado: true },
    ])
      await list(invalid).expect(400);
    await request(app.getHttpServer()).get('/estudiantes').expect(401);
  } finally {
    await app.close();
    if (previousApiKey === undefined) delete process.env.API_KEY;
    else process.env.API_KEY = previousApiKey;
  }
});

const benchmark =
  process.env.CIUNAC_ESTUDIANTES_BENCHMARK === '1' ? test : test.skip;
benchmark(
  'PERF estudiantes mide busqueda y listado sobre 50000 filas',
  async () => {
    const runner = db.pg.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await runner.query(`
      INSERT INTO estudiantes
        (nombres, apellidos, genero, fecha_nacimiento, tipo_documento, numero_documento, celular, codigo)
      SELECT 'Estudiante', 'Apellido ' || (i % 5000), 'F', DATE '2000-01-01',
        'DNI', LPAD(i::text, 8, '0'), '999999999', 'MUESTRA-' || LPAD(i::text, 6, '0')
      FROM generate_series(1, 50000) AS series(i)
    `);
      await runner.query('ANALYZE estudiantes');
      const instance = service(
        moduleFile('principales', 'estudiantes'),
        'EstudiantesService',
        ...['Estudiante', 'Facultad', 'Escuela'].map((name) =>
          runner.manager.getRepository(db.classes[name]),
        ),
      );
      const query = jest.spyOn(runner, 'query');
      try {
        for (const [label, filters] of [
          ['primera pagina', { limit: 25 }],
          [
            'busqueda por codigo parcial',
            { search: 'muestra-0042', limit: 25 },
          ],
        ]) {
          query.mockClear();
          const result = await instance.findAll(filters);
          expect(result.data).toHaveLength(25);
          if (filters.search) expect(result.meta.total).toBe(100);
          const queries = query.mock.calls.slice();
          expect(queries).toHaveLength(2);
          const timings = [];
          for (const [sql, params] of queries) {
            const rows = await runner.query(
              `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sql}`,
              params,
            );
            timings.push(rows[0]['QUERY PLAN'][0]['Execution Time']);
          }
          console.info(
            `PERF estudiantes (${label}, 50000 filas sinteticas) PostgreSQL count=${timings[0]} ms, pagina=${timings[1]} ms`,
          );
        }
      } finally {
        query.mockRestore();
      }
    } finally {
      await runner.rollbackTransaction();
      await runner.release();
    }
  },
  30000,
);

test('INT fecha estudiante no cambia de dia en UTC ni America Lima', () => {
  for (const timezone of ['UTC', 'America/Lima']) {
    const output = execFileSync(
      process.execPath,
      [absolute('test/sdd/date-probe.cjs'), '--student'],
      {
        encoding: 'utf8',
        env: { ...process.env, TZ: timezone },
        windowsHide: true,
      },
    );
    expect(JSON.parse(output)).toEqual({
      timezone,
      created: '2000-01-01',
      updated: '2004-02-29',
    });
  }
});

test('INT rechazo persiste observaciones y es idempotente', async () => {
  for (const estadoId of [1, 2, 3, 4, 12]) {
    const original = await solicitud({ estadoId });
    const result = await solicitudes.reject(original.id, {
      observaciones: ' Voucher invalido ',
    });
    expect(result.notificacion.estado).toBe('ENVIADA');
    assertContract('SolicitudesController_reject', result);
    expect(
      await db.repo('Solicitud').findOneBy({ id: original.id }),
    ).toMatchObject({ estadoId: 5, observaciones: 'Voucher invalido' });
    const count = mailer.sendMail.mock.calls.length;
    const retry = await solicitudes.reject(original.id, {
      observaciones: 'No reemplazar',
    });
    expect(retry.notificacion).toEqual({
      estado: 'NO_APLICA',
      motivo: 'YA_RECHAZADA',
    });
    expect(retry.solicitud.observaciones).toBe('Voucher invalido');
    expect(mailer.sendMail).toHaveBeenCalledTimes(count);
  }
  expect(mailer.sendMail).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'SOLICITUD_RECHAZADA',
      email: base.estudiante.email,
    }),
  );
});

test('INT rechazo conserva estado ante email ausente o SMTP fallido', async () => {
  const noEmail = await db.seed('Estudiante', {
    numeroDocumento: '10000001',
    email: null,
  });
  const first = await solicitud({ estudianteId: noEmail.id });
  expect(
    (await solicitudes.reject(first.id, { observaciones: 'Motivo' }))
      .notificacion.motivo,
  ).toBe('ESTUDIANTE_SIN_EMAIL');
  mailer.sendMail.mockRejectedValueOnce(new Error('SMTP simulado'));
  const second = await solicitud();
  expect(
    (await solicitudes.reject(second.id, { observaciones: 'Motivo SMTP' }))
      .notificacion.motivo,
  ).toBe('ERROR_ENVIO');
  expect(
    (await db.repo('Solicitud').findOneBy({ id: second.id })).estadoId,
  ).toBe(5);
  await expect(
    solicitudes.reject(2147483647, { observaciones: 'Motivo' }),
  ).rejects.toMatchObject({ status: 404 });
});

test('INT rechazo no modifica solicitud si estado no esta configurado', async () => {
  const request = await solicitud();
  await db.repo('Estado').update(5, { referencia: 'CERTIFICADO' });
  try {
    await expect(
      solicitudes.reject(request.id, { observaciones: 'Motivo' }),
    ).rejects.toMatchObject({ status: 500 });
    expect(
      await db.repo('Solicitud').findOneBy({ id: request.id }),
    ).toMatchObject({ estadoId: 1, observaciones: null });
    expect(mailer.sendMail).not.toHaveBeenCalled();
  } finally {
    await db.repo('Estado').update(5, { referencia: 'SOLICITUD' });
  }
});

test('INT solicitud manual evita duplicados pendientes', async () => {
  const student = await db.seed('Estudiante', { numeroDocumento: '10000002' });
  const item = await solicitud({ estudianteId: student.id });
  await expect(
    solicitudes.create({ ...item, id: undefined, manual: true }),
  ).rejects.toMatchObject({ status: 409 });
  expect(await db.repo('Solicitud').countBy({ estudianteId: student.id })).toBe(
    1,
  );
});

test('INT conciliacion CSV paga observa omite duplicados y revierte lote invalido', async () => {
  const paid = await solicitud({ numeroVoucher: 'CSV-PAID' });
  const observed = await solicitud({ numeroVoucher: 'CSV-OBS' });
  const result = await pagos.uploadAndProcess(
    csv('CSV-PAID;50;20261001', 'CSV-OBS;49;20261001', 'CSV-PAID;50;20261001'),
  );
  expect(result.resumen).toMatchObject({
    pagosRegistrados: 2,
    duplicadosOmitidos: 1,
    solicitudesPagadas: 1,
    solicitudesObservadas: 1,
  });
  expect((await db.repo('Solicitud').findOneBy({ id: paid.id })).estadoId).toBe(
    4,
  );
  expect(
    await db.repo('Solicitud').findOneBy({ id: observed.id }),
  ).toMatchObject({
    estadoId: 12,
    observaciones: expect.stringContaining('monto'),
  });
  expect(
    (await pagos.uploadAndProcess(csv('CSV-PAID;50;20261001'))).resumen
      .duplicadosOmitidos,
  ).toBe(1);
  const count = await db.repo('PagosBanco').count();
  await expect(
    pagos.uploadAndProcess(
      csv('CSV-NOT-SAVED;50;20261001', 'CSV-BAD;bad;20261099'),
    ),
  ).rejects.toMatchObject({ status: 400 });
  expect(await db.repo('PagosBanco').count()).toBe(count);
});

test('INT reverificacion enlaza pago pendiente y observa voucher reutilizado', async () => {
  await pagos.uploadAndProcess(csv('CSV-LATE;50;20261001'));
  const late = await solicitud({ numeroVoucher: 'CSV-LATE' });
  expect(
    (await pagos.reverifyUnverified()).resumen.pagosVerificados,
  ).toBeGreaterThanOrEqual(1);
  expect((await db.repo('Solicitud').findOneBy({ id: late.id })).estadoId).toBe(
    4,
  );
  const reused = await solicitud({ numeroVoucher: 'CSV-LATE' });
  await pagos.reverifyUnverified();
  expect(
    (await db.repo('Solicitud').findOneBy({ id: reused.id })).estadoId,
  ).toBe(12);
});

test('INT conciliacion revierte cambios si falla insercion bancaria', async () => {
  const request = await solicitud({ numeroVoucher: 'CSV-PG-FAIL' });
  await db.pg.query(
    "CREATE FUNCTION sdd_fail_payment() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.numero_voucher = 'CSV-PG-FAIL' THEN RAISE EXCEPTION 'SDD simulated persistence failure'; END IF; RETURN NEW; END $$",
  );
  await db.pg.query(
    'CREATE TRIGGER sdd_fail_payment BEFORE INSERT ON pagos_banco FOR EACH ROW EXECUTE FUNCTION sdd_fail_payment()',
  );
  try {
    await expect(
      pagos.uploadAndProcess(csv('CSV-PG-FAIL;50;20261001')),
    ).rejects.toMatchObject({ status: 500 });
    expect(
      (await db.repo('Solicitud').findOneBy({ id: request.id })).estadoId,
    ).toBe(1);
    expect(
      await db.repo('PagosBanco').countBy({ numeroVoucher: 'CSV-PG-FAIL' }),
    ).toBe(0);
  } finally {
    await db.pg.query('DROP TRIGGER sdd_fail_payment ON pagos_banco');
    await db.pg.query('DROP FUNCTION sdd_fail_payment()');
  }
});

test('INT fecha bancaria caracteriza riesgo de persistencia fuera de UTC', () => {
  const output = execFileSync(
    process.execPath,
    [absolute('test/sdd/date-probe.cjs')],
    {
      encoding: 'utf8',
      env: { ...process.env, TZ: 'America/Lima' },
      windowsHide: true,
    },
  );
  expect(JSON.parse(output)).toEqual({
    timezone: 'America/Lima',
    stored: '2026-09-30',
  });
});

test('INT recuperacion almacena hash consume token una vez y oculta cuenta', async () => {
  const usuarios = service(
    moduleFile('authentication', 'usuarios'),
    'UsuariosService',
    db.repo('Usuario'),
  );
  const docentes = service(
    moduleFile('principales', 'docentes'),
    'DocentesService',
    db.repo('Docente'),
  );
  const auth = service(
    moduleFile('authentication', 'auth'),
    'AuthService',
    usuarios,
    new JwtService({ secret: 'test-only' }),
    docentes,
    db.pg,
    new ConfigService({
      PASSWORD_RESET_FRONTEND_URL: 'https://example.invalid/reset',
    }),
    mailer,
  );
  const user = await usuarios.createLocal(
    'reset@example.invalid',
    'InitialPassword123!',
    'ESTUDIANTE',
  );
  const result = await auth.forgotPassword(' RESET@EXAMPLE.INVALID ');
  const resetUrl = mailer.sendPasswordReset.mock.calls[0][1];
  const token = new URL(resetUrl).searchParams.get('token');
  const stored = await db
    .repo('PasswordResetToken')
    .findOneBy({ usuarioId: user.id });
  expect(stored.tokenHash).toBe(
    createHash('sha256').update(token).digest('hex'),
  );
  expect(stored.tokenHash).not.toBe(token);
  await auth.forgotPassword(user.email);
  expect(mailer.sendPasswordReset).toHaveBeenCalledTimes(1);
  expect(await auth.forgotPassword('unknown@example.invalid')).toEqual(result);
  const payload = {
    token,
    newPassword: 'ReplacementPassword123!',
    confirmPassword: 'ReplacementPassword123!',
  };
  await auth.resetPassword(payload);
  const updated = await db.repo('Usuario').findOneBy({ id: user.id });
  expect(await bcrypt.compare(payload.newPassword, updated.password)).toBe(
    true,
  );
  expect(updated.refreshTokenHash).toBeNull();
  await expect(auth.resetPassword(payload)).rejects.toMatchObject({
    status: 400,
  });
});

test('INT recuperacion invalida token si falla SMTP', async () => {
  const usuarios = service(
    moduleFile('authentication', 'usuarios'),
    'UsuariosService',
    db.repo('Usuario'),
  );
  const user = await usuarios.createLocal(
    'smtp@example.invalid',
    'InitialPassword123!',
    'ESTUDIANTE',
  );
  const auth = service(
    moduleFile('authentication', 'auth'),
    'AuthService',
    usuarios,
    new JwtService({ secret: 'test' }),
    service(
      moduleFile('principales', 'docentes'),
      'DocentesService',
      db.repo('Docente'),
    ),
    db.pg,
    new ConfigService({
      PASSWORD_RESET_FRONTEND_URL: 'https://example.invalid/reset',
    }),
    mailer,
  );
  mailer.sendPasswordReset.mockRejectedValueOnce(new Error('SMTP simulado'));
  await auth.forgotPassword(user.email);
  expect(
    await db.repo('PasswordResetToken').countBy({ usuarioId: user.id }),
  ).toBe(0);
});

test('INT SQL id_q10 es repetible permite nulos e impide duplicados', async () => {
  const runner = db.pg.createQueryRunner();
  await runner.connect();
  await runner.startTransaction();
  try {
    await runner.query('ALTER TABLE estudiantes DROP COLUMN id_q10');
    const sql = fs.readFileSync(
      absolute('docs/sql/add-id-q10-to-estudiantes.sql'),
      'utf8',
    );
    await runner.query(sql);
    await runner.query(sql);
    const result = await runner.query(
      "SELECT character_maximum_length FROM information_schema.columns WHERE table_name='estudiantes' AND column_name='id_q10'",
    );
    expect(result[0].character_maximum_length).toBe(100);
    await runner.query('UPDATE estudiantes SET id_q10 = NULL');
    await runner.query('UPDATE estudiantes SET id_q10 = $1 WHERE id = $2', [
      'UNIQUE-SDD',
      base.estudiante.id,
    ]);
    await expect(
      runner.query('UPDATE estudiantes SET id_q10 = $1 WHERE id <> $2', [
        'UNIQUE-SDD',
        base.estudiante.id,
      ]),
    ).rejects.toMatchObject({ code: '23505' });
  } finally {
    await runner.rollbackTransaction();
    await runner.release();
  }
});

function drive() {
  return {
    uploadToDrive: jest.fn().mockResolvedValue({
      id: 'original',
      name: 'cert.pdf',
      viewLink: 'https://example.invalid/original',
      downloadLink: 'https://example.invalid/download',
      folder: 'CERTIFICADOS',
    }),
    getCertificatePeriodFolderId: jest.fn().mockResolvedValue('period-folder'),
    findSignedVersion: jest.fn().mockResolvedValue({
      originalFile: { id: 'original' },
      signedFile: { id: 'signed' },
    }),
    moveFileToRepository: jest
      .fn()
      .mockResolvedValue({ id: 'signed', name: 'signed.pdf' }),
    trashFile: jest.fn().mockResolvedValue(undefined),
  };
}
async function certificado(serviceInstance, request) {
  return serviceInstance.create({
    tipo: 'VIRTUAL',
    periodo: '2026-10',
    estudiante: 'Alumna SDD',
    numeroDocumento: base.estudiante.numeroDocumento,
    idioma: 'Ingles',
    idiomaId: base.idioma.id,
    nivel: 'Basico',
    nivelId: base.nivel.id,
    cantidadHoras: 100,
    solicitudId: request.id,
    fechaEmision: new Date(),
    numeroRegistro: 'REG-SDD',
    fechaConcluido: new Date(),
    elaboradoPor: 'SDD',
    notas: [],
  });
}

test('INT certificado guarda driveId luego URL firmada y solicitud terminada', async () => {
  const model = db.model(
    'src/modules/administrativas/certificados/schemas/certificado.schema.ts',
    'Certificado',
    'CertificadoSchema',
  );
  const upload = drive();
  const instance = service(
    moduleFile('administrativas', 'certificados'),
    'CertificadosService',
    model,
    upload,
    solicitudes,
  );
  const request = await solicitud({ estadoId: 4 });
  const doc = await certificado(instance, request);
  assertContract('CertificadosController_create', doc);
  expect(doc.url).toBeNull();
  expect((await solicitudes.findOne(request.id)).estadoId).toBe(4);
  await instance.subirArchivo(doc.id, {
    mimetype: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7'),
    originalname: 'cert.pdf',
  });
  expect(await instance.findOne(doc.id)).toMatchObject({
    driveId: 'original',
    url: null,
  });
  const signed = await instance.procesarFirma(
    doc.id,
    'original',
    request.id,
    'signed',
  );
  assertContract('CertificadosController_procesarFirma', signed);
  expect(await instance.findOne(doc.id)).toMatchObject({
    driveId: 'signed',
    driveIdOriginal: 'original',
    impreso: true,
    url: 'https://drive.google.com/uc?export=download&id=signed',
    originalTrashed: true,
  });
  expect((await solicitudes.findOne(request.id)).estadoId).toBe(3);
});

test('INT certificado compensa Mongo si PostgreSQL falla durante firma', async () => {
  const model = db.mongo.model('Certificado');
  const instance = service(
    moduleFile('administrativas', 'certificados'),
    'CertificadosService',
    model,
    drive(),
    solicitudes,
  );
  const request = await solicitud({ estadoId: 4 });
  const doc = await certificado(instance, request);
  await instance.update(doc.id, { driveId: 'original' });
  // Fault injection at the persistence boundary; the business service remains real.
  const failure = jest
    .spyOn(db.repo('Solicitud'), 'update')
    .mockRejectedValueOnce(new Error('PG simulado'));
  try {
    await expect(instance.procesarFirma(doc.id, 'original')).rejects.toThrow(
      'PG simulado',
    );
  } finally {
    failure.mockRestore();
  }
  expect(await instance.findOne(doc.id)).toMatchObject({
    driveId: 'original',
    url: null,
    impreso: false,
  });
});

async function examen() {
  const exam = await db.seed('Examenesubicacion', {
    idiomaId: base.idioma.id,
    docenteId: base.docente.id,
    aulaId: base.aula.id,
    estadoId: 8,
  });
  const request = await solicitud({ tipoSolicitudId: 7, estadoId: 3 });
  const calificacion =
    (await db
      .repo('Calificacionesubicacion')
      .findOneBy({ cicloId: base.ciclo.id })) ??
    (await db.seed('Calificacionesubicacion', {
      cicloId: base.ciclo.id,
      idiomaId: base.idioma.id,
      nivelId: base.nivel.id,
      notaMin: 0,
      notaMax: 100,
    }));
  await db.seed('Detallesubicacion', {
    examenId: exam.id,
    solicitudId: request.id,
    estudianteId: base.estudiante.id,
    idiomaId: base.idioma.id,
    nivelId: base.nivel.id,
    calificacionId: calificacion.id,
    nota: 80,
    terminado: true,
    activo: true,
  });
  return exam;
}
function actas() {
  const model =
    db.mongo.models.ActaExamenUbicacion ??
    db.model(
      'src/modules/examen_ubicacion/actasexamenubicacion/schemas/actasexamenubicacion.schema.ts',
      'ActaExamenUbicacion',
      'ActaExamenUbicacionSchema',
    );
  return service(
    moduleFile('examen_ubicacion', 'actasexamenubicacion'),
    'ActasexamenubicacionService',
    model,
    db.repo('Examenesubicacion'),
    db.repo('Detallesubicacion'),
    db.repo('Solicitud'),
  );
}
test('INT acta unica inmutable actualiza examen y conserva snapshot', async () => {
  const instance = actas();
  await instance.onModuleInit();
  const exam = await examen();
  const result = await instance.create(
    { examenId: exam.id },
    {
      usuarioId: base.docente.id,
      email: 'admin@example.invalid',
      rol: 'ADMINISTRATIVO',
    },
  );
  expect(result.participantes[0]).toMatchObject({ nota: 80, terminado: true });
  assertContract('ActasexamenubicacionController_create', result);
  expect(
    await db.repo('Examenesubicacion').findOneBy({ id: exam.id }),
  ).toMatchObject({ estadoId: 13, actaId: result.id });
  await expect(
    instance.create({ examenId: exam.id }, {}),
  ).rejects.toMatchObject({ status: 409 });
  expect(() => instance.update(result.id, {})).toThrow();
  expect(() => instance.remove(result.id)).toThrow();
  await expect(
    db.mongo
      .model('ActaExamenUbicacion')
      .collection.insertOne({ examenId: exam.id }),
  ).rejects.toMatchObject({ code: 11000 });
});
test('INT acta elimina insercion Mongo si falla actualizacion PostgreSQL', async () => {
  const instance = actas();
  const exam = await examen();
  const failure = jest
    .spyOn(db.repo('Examenesubicacion'), 'update')
    .mockRejectedValueOnce(new Error('PG simulado'));
  try {
    await expect(
      instance.create(
        { examenId: exam.id },
        {
          usuarioId: base.docente.id,
          email: 'admin@example.invalid',
          rol: 'ADMINISTRATIVO',
        },
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(failure).toHaveBeenCalledTimes(1);
  } finally {
    failure.mockRestore();
  }
  expect(
    await db.mongo
      .model('ActaExamenUbicacion')
      .countDocuments({ examenId: exam.id }),
  ).toBe(0);
  expect(
    (await db.repo('Examenesubicacion').findOneBy({ id: exam.id })).estadoId,
  ).toBe(8);
});

test('INT Q10 sincroniza id local y conserva codigo ante matricula fallida', async () => {
  const docentes = service(
    moduleFile('principales', 'docentes'),
    'DocentesService',
    db.repo('Docente'),
  );
  const grupos = service(
    moduleFile('estructura', 'grupos'),
    'GruposService',
    db.repo('Grupo'),
  );
  const ciclos = service(
    moduleFile('estructura', 'ciclos'),
    'CiclosService',
    db.repo('Ciclo'),
  );
  const q10 = service(
    'src/q10/q10.service.ts',
    'Q10Service',
    estudiantes,
    docentes,
    grupos,
    ciclos,
  );
  const original = global.fetch;
  let pending = false;
  let q10Code = 'Q10-SDD';
  global.fetch = jest.fn(async (url) => {
    if (url.includes('/periodos'))
      return {
        ok: true,
        json: async () => [{ Consecutivo: 10, Ordenamiento: 1 }],
      };
    if (url.includes('/inscripciones'))
      return { ok: true, json: async () => [{ Consecutivo_inscripcion: 20 }] };
    if (url.includes('/matriculasProgramas'))
      return { ok: !pending, json: async () => ({ matricula: 1 }) };
    return { ok: true, json: async () => ({ Codigo_estudiante: q10Code }) };
  });
  const payload = {
    Primer_nombre: 'Ana',
    Primer_apellido: 'SDD',
    Segundo_apellido: 'Test',
    Email: 'q10@example.invalid',
    Codigo_tipo_identificacion: 'PE01',
    Numero_identificacion: '11112222',
    Genero: 'F',
    Fecha_nacimiento: '2000-01-01',
    Celular: '999999999',
    Telefono: '999999999',
  };
  try {
    const first = await q10.crearEstudianteEnQ10(payload);
    const repeated = await q10.crearEstudianteEnQ10(payload);
    expect(repeated.estudiante.id).toBe(first.estudiante.id);
    expect(
      await db
        .repo('Estudiante')
        .countBy({ numeroDocumento: payload.Numero_identificacion }),
    ).toBe(1);
    // Only isolated SDD data is deleted; Q10 is a double throughout this test.
    const retainedUser = await db.seed('Usuario', {
      email: 'q10-retained@example.invalid',
      rol: 'ESTUDIANTE',
    });
    await db
      .repo('Estudiante')
      .update(first.estudiante.id, { usuario: retainedUser });
    await db.repo('Estudiante').delete(first.estudiante.id);
    expect(await db.repo('Usuario').countBy({ id: retainedUser.id })).toBe(1);
    q10Code = 'Q10-RECREATED';
    const recreated = await q10.crearEstudianteEnQ10(payload);
    expect(recreated.estudiante.id).not.toBe(first.estudiante.id);
    expect(recreated.estudiante.idQ10).toBe('Q10-RECREATED');
    expect(
      await db
        .repo('Estudiante')
        .countBy({ numeroDocumento: payload.Numero_identificacion }),
    ).toBe(1);
    await expect(
      q10.crearEstudianteEnQ10({
        ...payload,
        Numero_identificacion: '11115555',
      }),
    ).rejects.toMatchObject({ status: 409 });
    const local = await db.seed('Estudiante', { numeroDocumento: '11114444' });
    q10Code = 'Q10-LOCAL';
    const linked = await q10.crearEstudianteEnQ10({
      ...payload,
      Numero_identificacion: local.numeroDocumento,
    });
    expect(linked.estudiante.id).toBe(local.id);
    expect(
      (await db.repo('Estudiante').findOneBy({ id: local.id })).idQ10,
    ).toBe(q10Code);
    q10Code = 'Q10-OTHER';
    await expect(q10.crearEstudianteEnQ10(payload)).rejects.toMatchObject({
      status: 409,
    });
    q10Code = 'Q10-LOCAL-FAIL';
    const failure = jest
      .spyOn(db.repo('Estudiante'), 'save')
      .mockRejectedValueOnce(new Error('PG simulado'));
    try {
      await expect(
        q10.crearEstudianteEnQ10({
          ...payload,
          Numero_identificacion: '11116666',
        }),
      ).rejects.toMatchObject({
        status: 502,
        response: expect.objectContaining({
          code: 'Q10_CREATED_LOCAL_SYNC_FAILED',
          retryAllowed: false,
        }),
      });
    } finally {
      failure.mockRestore();
    }
    q10Code = 'Q10-PENDING';
    pending = true;
    await expect(
      q10.crearEstudianteEnQ10({
        ...payload,
        Numero_identificacion: '11113333',
      }),
    ).rejects.toMatchObject({
      status: 502,
      response: expect.objectContaining({
        code: 'Q10_CREATED_PROGRAM_PENDING',
        retryAllowed: false,
      }),
    });
    expect(
      (await db.repo('Estudiante').findOneBy({ numeroDocumento: '11113333' }))
        .idQ10,
    ).toBe(q10Code);
    q10Code = undefined;
    await expect(q10.crearEstudianteEnQ10(payload)).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'Q10_CREATED_INVALID_RESPONSE',
      }),
    });
  } finally {
    global.fetch = original;
  }
});

test('INT estudiante nuevo persiste tipo documento y valida escuelas sin enviar campos locales a Q10', async () => {
  const faculty = await db.seed('Facultad');
  const schools = {};
  for (const tipo of ['PRE', 'POS']) {
    schools[tipo] = await db.seed('Escuela', { facultadId: faculty.id, tipo });
  }
  const historical = await db.seed('Escuela', {
    facultadId: faculty.id,
    tipo: null,
  });
  const q10 = service(
    'src/q10/q10.service.ts',
    'Q10Service',
    estudiantes,
    {},
    {},
    {},
  );
  const original = global.fetch;
  const remoteStudents = new Map();
  global.fetch = jest.fn(async (url, options) => {
    if (url.includes('/periodos'))
      return {
        ok: true,
        json: async () => [{ Consecutivo: 10, Ordenamiento: 1 }],
      };
    if (url.includes('/inscripciones'))
      return { ok: true, json: async () => [{ Consecutivo_inscripcion: 20 }] };
    if (url.includes('/matriculasProgramas'))
      return { ok: true, json: async () => ({ matricula: 1 }) };
    const { Numero_identificacion } = JSON.parse(options.body);
    if (!remoteStudents.has(Numero_identificacion)) {
      remoteStudents.set(
        Numero_identificacion,
        `Q10-TIPO-${remoteStudents.size + 1}`,
      );
    }
    return {
      ok: true,
      json: async () => ({
        Codigo_estudiante: remoteStudents.get(Numero_identificacion),
      }),
    };
  });
  const payload = {
    Primer_nombre: 'Ana',
    Primer_apellido: 'SDD',
    Segundo_apellido: 'Test',
    Email: 'documento@example.invalid',
    Codigo_tipo_identificacion: 'PE01',
    Genero: 'F',
    Fecha_nacimiento: '2000-01-01',
    Celular: '999999999',
    Telefono: '999999999',
    Codigo_programa: 'INGLES',
  };
  try {
    for (const [index, tipoEstudiante] of ['PRE', 'POS', 'PG'].entries()) {
      const escuelaId =
        tipoEstudiante === 'PG' ? historical.id : schools[tipoEstudiante].id;
      const Numero_identificacion = `2222000${index}`;
      const imgDoc = `https://drive.google.com/file/d/documento-${index}/view`;
      const codigo = `001234567${index}`;
      const result = await q10.crearEstudianteEnQ10({
        ...payload,
        Numero_identificacion,
        tipoEstudiante,
        codigo,
        imgDoc,
        facultadId: faculty.id,
        escuelaId,
      });
      const student = await estudiantes.findOne(result.estudiante.id);
      expect(student).toMatchObject({
        tipoEstudiante,
        codigo,
        imgDoc,
        escuelaId,
        facultadId: faculty.id,
        idQ10: result.estudiante.idQ10,
      });
      assertContract('EstudiantesController_findOne', student);
      const updated = {
        codigo: `009876543${index}`,
        imgDoc: `${imgDoc}?updated=1`,
      };
      for (const changes of [
        updated,
        {},
        { codigo: null, imgDoc: null, tipoEstudiante: null },
      ]) {
        const synchronized = await q10.crearEstudianteEnQ10({
          ...payload,
          Numero_identificacion,
          ...changes,
        });
        expect(synchronized.estudiante.id).toBe(student.id);
        expect(await estudiantes.findOne(student.id)).toMatchObject({
          tipoEstudiante,
          ...updated,
        });
      }
    }
    for (const [Numero_identificacion, optional] of [
      ['22220003', {}],
      ['22220005', { codigo: null, imgDoc: null }],
    ]) {
      const legacy = await q10.crearEstudianteEnQ10({
        ...payload,
        Numero_identificacion,
        ...optional,
      });
      expect(await estudiantes.findOne(legacy.estudiante.id)).toMatchObject({
        tipoEstudiante: null,
        codigo: null,
        imgDoc: null,
      });
    }
    const calls = global.fetch.mock.calls.length;
    for (const escuelaId of [historical.id, schools.POS.id]) {
      await expect(
        q10.crearEstudianteEnQ10({
          ...payload,
          Numero_identificacion: '22220004',
          tipoEstudiante: 'PRE',
          escuelaId,
        }),
      ).rejects.toMatchObject({ status: 400 });
    }
    await expect(
      q10.crearEstudianteEnQ10({
        ...payload,
        Numero_identificacion: '22220000',
        tipoEstudiante: null,
        escuelaId: schools.POS.id,
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(global.fetch).toHaveBeenCalledTimes(calls);
    expect(
      await db.repo('Estudiante').countBy({ numeroDocumento: '22220004' }),
    ).toBe(0);
    for (const [, options] of global.fetch.mock.calls) {
      if (!options?.body) continue;
      const remote = JSON.parse(options.body);
      for (const key of [
        'tipoEstudiante',
        'codigo',
        'imgDoc',
        'facultadId',
        'escuelaId',
      ])
        expect(remote).not.toHaveProperty(key);
    }
    const escuelas = service(
      'src/modules/auxiliares/escuelas/escuelas.service.ts',
      'EscuelasService',
      db.repo('Escuela'),
      db.repo('Estudiante'),
    );
    await expect(
      escuelas.update(schools.PRE.id, { tipo: 'POS' }),
    ).rejects.toMatchObject({ status: 400 });
    // Solo PG esta vinculado a la historica: no bloquea su clasificacion.
    await expect(
      escuelas.update(historical.id, { tipo: 'PRE' }),
    ).resolves.toMatchObject({ tipo: 'PRE' });
  } finally {
    global.fetch = original;
  }
});

test('INT SQL escuelas tipo es repetible y conserva historicos sin clasificar', async () => {
  const schema = 'sdd_escuelas_tipo';
  await db.pg.query(`CREATE SCHEMA ${schema}`);
  try {
    await db.pg.query(
      `CREATE TABLE ${schema}.escuelas (id integer PRIMARY KEY, nombre varchar NOT NULL, facultad_id integer NOT NULL)`,
    );
    await db.pg.query(
      `INSERT INTO ${schema}.escuelas VALUES (1, 'Historica', 3)`,
    );
    const sql = fs
      .readFileSync(absolute('docs/sql/add-tipo-to-escuelas.sql'), 'utf8')
      .replaceAll('public.', `${schema}.`)
      .replaceAll("table_schema = 'public'", `table_schema = '${schema}'`);
    await db.pg.query(sql);
    await db.pg.query(sql);
    expect(await db.pg.query(`SELECT * FROM ${schema}.escuelas`)).toEqual([
      { id: 1, nombre: 'Historica', facultad_id: 3, tipo: null },
    ]);
    await expect(
      db.pg.query(`UPDATE ${schema}.escuelas SET tipo = 'PG'`),
    ).rejects.toMatchObject({ code: '23514' });
    for (const tipo of ['PRE', 'POS']) {
      await db.pg.query(`UPDATE ${schema}.escuelas SET tipo = $1`, [tipo]);
      expect(await db.pg.query(`SELECT tipo FROM ${schema}.escuelas`)).toEqual([
        { tipo },
      ]);
    }
  } finally {
    await db.pg.query(`DROP SCHEMA ${schema} CASCADE`);
  }
});

test('INT resultados docentes persisten formula detalle y ranking', async () => {
  const { docente, idioma, modulo } = base;
  const perfil = await db.seed('PerfilDocente', {
    docenteId: docente.id,
    idiomaId: idioma.id,
    puntajeFinal: 90,
  });
  await db.seed('EncuestaMetricasDocente', {
    docenteId: docente.id,
    moduloId: modulo.id,
    promedioGeneral: 80,
  });
  for (const [puntaje, peso] of [
    [100, 0.1],
    [50, 0.1],
    [75, 0.2],
  ]) {
    const rubro = await db.seed('AcademicoAdministrativo', { peso });
    await db.seed('CumplimientoDocente', {
      docenteId: docente.id,
      moduloId: modulo.id,
      academicoAdministrativoId: rubro.id,
      puntaje,
    });
  }
  const modulos = service(
    moduleFile('estructura', 'modulos'),
    'ModulosService',
    db.repo('Modulo'),
  );
  const results = service(
    moduleFile('seguimiento_docente', 'perfil_docente_resultados'),
    'PerfilDocenteResultadosService',
    db.repo('PerfilDocenteResultado'),
    db.repo('EncuestaMetricasDocente'),
    db.repo('CumplimientoDocente'),
    db.repo('PerfilDocente'),
    db.repo('EncuestaRespuesta'),
    modulos,
  );
  const result = await results.generarResultado(modulo.id, docente.id);
  expect(Number(result.resultadoFinal)).toBeCloseTo(81, 5);
  expect(
    Number(
      (await db.repo('PerfilDocenteResultado').findOneBy({ id: result.id }))
        .resultadoFinal,
    ),
  ).toBeCloseTo(81, 5);
  const detail = await results.getDetalleEvaluacion(modulo.id, docente.id);
  assertContract(
    'PerfilDocenteResultadosController_getDetalleEvaluacion',
    detail,
  );
  expect(detail.cumplimiento.map((row) => row.puntajePonderado)).toEqual([
    '10.00',
    '5.00',
    '15.00',
  ]);
  expect(detail).not.toHaveProperty('pilares');
  const dashboard = service(
    moduleFile('seguimiento_docente', 'dashboard_docentes'),
    'DashboardDocentesService',
    db.repo('PerfilDocenteResultado'),
    db.repo('EncuestaRespuesta'),
    db.repo('Docente'),
    db.repo('DocumentosDocente'),
    db.repo('PerfilDocente'),
    db.repo('CumplimientoDocente'),
    db.repo('EncuestaRespuestasDetalle'),
    modulos,
  );
  const ranking = await dashboard.getRankingDocentes();
  assertContract('DashboardDocentesController_getRankingDocentes', ranking);
  expect(
    ranking.find((row) => row.docenteId === docente.id).perfilDocente.id,
  ).toBe(perfil.id);
  expect(
    Number(ranking.find((row) => row.docenteId === docente.id).resultadoFinal),
  ).toBeCloseTo(81, 5);
  expect(new Set(ranking.map((row) => row.id)).size).toBe(ranking.length);
});

test('INT constancia crea sin transicion y firma persiste URL con warning de limpieza', async () => {
  const model = db.model(
    'src/modules/administrativas/constancias/schemas/constancia.schema.ts',
    'Constancia',
    'ConstanciaSchema',
  );
  const upload = drive();
  const instance = service(
    moduleFile('administrativas', 'constancias'),
    'ConstanciasService',
    model,
    upload,
    solicitudes,
  );
  const request = await solicitud({ estadoId: 4 });
  const document = await instance.create({
    tipo: 'MATRICULA',
    estudiante: 'Ana SDD',
    dni: base.estudiante.numeroDocumento,
    idioma: 'Ingles',
    idiomaId: base.idioma.id,
    nivel: 'Basico',
    nivelId: base.nivel.id,
    ciclo: 1,
    id_solicitud: request.id,
    url: 'https://example.invalid/original',
    modalidad: 'REGULAR',
    driveId: 'original',
  });
  expect((await solicitudes.findOne(request.id)).estadoId).toBe(4);
  assertContract('ConstanciasController_create', document);
  upload.trashFile.mockRejectedValueOnce(new Error('Drive simulado'));
  const result = await instance.procesarFirma(
    document.id,
    'original',
    request.id,
    'signed',
  );
  expect(result).toMatchObject({
    success: true,
    originalTrashed: false,
    warning: expect.any(String),
  });
  expect(await instance.findOne(document.id)).toMatchObject({
    impreso: true,
    url: 'https://drive.google.com/uc?export=download&id=signed',
  });
  expect((await solicitudes.findOne(request.id)).estadoId).toBe(3);
  assertContract('ConstanciasController_procesarFirma', result);
});

test.each(['R', 'FIRMADO'])(
  'INT firma %s resuelve Drive archiva actualiza ambos almacenes y reintenta sin borrar el firmado',
  async (marker) => {
    const previousFolders = {
      GOOGLE_DRIVE_FOLDER_CONSTANCIAS_REPOSITORIO:
        process.env.GOOGLE_DRIVE_FOLDER_CONSTANCIAS_REPOSITORIO,
      GOOGLE_DRIVE_FOLDER_CERTIFICADOS_REPOSITORIO:
        process.env.GOOGLE_DRIVE_FOLDER_CERTIFICADOS_REPOSITORIO,
    };
    process.env.GOOGLE_DRIVE_FOLDER_CONSTANCIAS_REPOSITORIO =
      'constancias-repository';
    process.env.GOOGLE_DRIVE_FOLDER_CERTIFICADOS_REPOSITORIO =
      'certificados-repository';
    try {
      for (const kind of ['constancias', 'certificados']) {
        const originalId = `${kind}-${marker}-original`;
        const signedId = `${kind}-${marker}-signed`;
        const baseName = `${kind}-documento-123`;
        const targetFolder =
          kind === 'certificados' ? 'period-folder' : 'constancias-repository';
        const signedName =
          kind === 'certificados'
            ? `${baseName}[${marker}].pdf`
            : `[${marker}] ${baseName}.pdf`;
        const files = new Map([
          [
            originalId,
            {
              id: originalId,
              name: `${baseName}.pdf`,
              parents: ['source-folder'],
              trashed: false,
            },
          ],
          [
            signedId,
            {
              id: signedId,
              name: signedName,
              parents: ['source-folder'],
              trashed: false,
              modifiedTime: '2026-11-18T10:00:00Z',
            },
          ],
        ]);
        const upload = service(
          'src/shared/upload/upload.service.ts',
          'UploadService',
          {},
        );
        let instance;
        let document;
        const request = await solicitud({ estadoId: 4 });
        const driveClient = {
          files: {
            get: jest.fn(async ({ fileId }) => ({
              data: { ...files.get(fileId) },
            })),
            list: jest.fn(async ({ q }) => ({
              data: {
                files: q.includes('mimeType =')
                  ? [{ id: 'period-folder', name: '2026-10' }]
                  : [...files.values()].filter(
                      (file) =>
                        !file.trashed &&
                        file.parents.some((folder) =>
                          q.includes(`'${folder}' in parents`),
                        ),
                    ),
              },
            })),
            update: jest.fn(async ({ fileId, addParents, requestBody }) => {
              const file = files.get(fileId);
              if (requestBody?.trashed) {
                // La limpieza solo puede ocurrir despues de ambas escrituras reales.
                expect(await instance.findOne(document.id)).toMatchObject({
                  driveId: signedId,
                  impreso: true,
                });
                expect((await solicitudes.findOne(request.id)).estadoId).toBe(
                  3,
                );
                expect(fileId).toBe(originalId);
                file.trashed = true;
              }
              if (addParents) file.parents = [addParents];
              return { data: { ...file } };
            }),
          },
          permissions: {
            list: jest.fn(async () => ({
              data: { permissions: [{ type: 'anyone', role: 'reader' }] },
            })),
          },
        };
        Reflect.set(upload, 'driveClient', driveClient);
        const isCertificate = kind === 'certificados';
        const modelName = isCertificate ? 'Certificado' : 'Constancia';
        instance = service(
          moduleFile('administrativas', kind),
          `${modelName}sService`,
          db.mongo.model(modelName),
          upload,
          solicitudes,
        );
        if (isCertificate) {
          document = await certificado(instance, request);
          await instance.update(document.id, { driveId: originalId });
        } else {
          document = await instance.create({
            tipo: 'MATRICULA',
            estudiante: 'Ana SDD',
            dni: base.estudiante.numeroDocumento,
            idioma: 'Ingles',
            idiomaId: base.idioma.id,
            nivel: 'Basico',
            nivelId: base.nivel.id,
            ciclo: 1,
            id_solicitud: request.id,
            modalidad: 'REGULAR',
            driveId: originalId,
            url: 'https://example.invalid/original',
          });
        }
        const result = await instance.procesarFirma(
          document.id,
          'stale-frontend-id',
          request.id,
        );
        const url = `https://drive.google.com/uc?export=download&id=${signedId}`;
        expect(result).toMatchObject({
          success: true,
          fileId: signedId,
          name: signedName,
          viewLink: url,
          originalTrashed: true,
        });
        expect(await instance.findOne(document.id)).toMatchObject({
          driveId: signedId,
          driveIdOriginal: originalId,
          url,
          impreso: true,
          originalTrashed: true,
        });
        expect(files.get(signedId)).toMatchObject({
          parents: [targetFolder],
          trashed: false,
        });
        expect(files.get(originalId).trashed).toBe(true);
        const writes = driveClient.files.update.mock.calls.length;
        await expect(
          instance.procesarFirma(document.id, undefined),
        ).resolves.toMatchObject({
          success: true,
          fileId: signedId,
          originalTrashed: true,
        });
        expect(driveClient.files.update).toHaveBeenCalledTimes(writes);
        expect(files.get(signedId).trashed).toBe(false);
      }
    } finally {
      for (const [key, value] of Object.entries(previousFolders)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  },
);

test('INT encuesta CSV persiste respuestas detalles y metricas sin deduplicar', async () => {
  const docente = await db.seed('Docente', { numeroDocumento: '22223333' });
  const modulo = await db.seed('Modulo', { nombre: '2026-11', activo: false });
  const question = await db.seed('EncuestaPregunta');
  const instance = service(
    moduleFile('seguimiento_docente', 'encuesta_respuestas'),
    'EncuestaRespuestasService',
    db.repo('EncuestaRespuesta'),
    service(
      moduleFile('principales', 'docentes'),
      'DocentesService',
      db.repo('Docente'),
    ),
    service(
      moduleFile('estructura', 'modulos'),
      'ModulosService',
      db.repo('Modulo'),
    ),
    db.pg,
  );
  const buffer = Buffer.from(
    `N\u00famero Identificaci\u00f3n;Docente;Curso;Per\u00edodo;Estudiante;Comentario;${question.id}\n${docente.numeroDocumento};Ana;G1;${modulo.nombre};Alumno;OK;Excelente`,
  );
  await instance.uploadAndProcess(buffer);
  await instance.uploadAndProcess(buffer);
  expect(
    await db.repo('EncuestaRespuesta').countBy({ docenteId: docente.id }),
  ).toBe(2);
  expect(
    await db
      .repo('EncuestaMetricasDocente')
      .findOneBy({ docenteId: docente.id, moduloId: modulo.id }),
  ).toMatchObject({
    promedioGeneral: '100.00',
    totalEncuestados: 2,
    totalCursos: 1,
  });
  expect(
    await db.repo('EncuestaRespuestasDetalle').count(),
  ).toBeGreaterThanOrEqual(2);
});
