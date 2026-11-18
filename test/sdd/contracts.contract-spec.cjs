const request = require('supertest');
const jwt = require('jsonwebtoken');
const Ajv = require('ajv');
const { ValidationPipe } = require('@nestjs/common');
const {
  absolute,
  discover,
  security,
} = require('../../scripts/sdd/source.cjs');
const {
  createContractApplication,
} = require('../../scripts/sdd/application.cjs');
const { UUID, example, requestFixture } = require('./fixtures.cjs');

const source = discover();
const state = {
  reply: undefined,
  calls: [],
  permissions: [],
  authenticating: false,
};
const secret = 'ciunac-sdd-contract-tests-only';
let context;
let token;
let ajv;
const previous = {
  API_KEY: process.env.API_KEY,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  EXCEPTION_ROLE: process.env.EXCEPTION_ROLE,
};
const immutable = /ActasexamenubicacionController_(update|remove)/;

function mocker(dependency) {
  const tokenName = dependency?.name ?? String(dependency);
  return new Proxy(
    {},
    {
      get(_target, method) {
        if (
          typeof method !== 'string' ||
          [
            'then',
            'onModuleInit',
            'onModuleDestroy',
            'beforeApplicationShutdown',
            'onApplicationBootstrap',
            'onApplicationShutdown',
          ].includes(method)
        )
          return undefined;
        return (...args) => {
          if (tokenName === 'RolesService' && method === 'getPermissionsByRole')
            return Promise.resolve(state.permissions);
          if (
            tokenName === 'UsuariosService' &&
            method === 'findOne' &&
            state.authenticating
          ) {
            state.authenticating = false;
            return Promise.resolve({
              id: UUID,
              email: 'sdd@example.invalid',
              rol: 'ADMINISTRATIVO',
            });
          }
          state.calls.push({ dependency: tokenName, method, args });
          if (immutable.test(state.route?.operationId ?? '')) {
            const { ConflictException } = require('@nestjs/common');
            throw new ConflictException({
              code: 'ACTA_INMUTABLE',
              message: 'Las actas no se modifican ni eliminan',
            });
          }
          return state.reply;
        };
      },
    },
  );
}

beforeAll(async () => {
  process.env.API_KEY = 'ciunac-sdd-api-key';
  process.env.JWT_ACCESS_SECRET = secret;
  process.env.EXCEPTION_ROLE = 'NO_EXCEPTION_IN_SDD_TESTS';
  const { JwtStrategy } = require(
    absolute('dist/modules/authentication/auth/strategies/jwt.strategy.js'),
  );
  context = await createContractApplication({
    providers: [JwtStrategy],
    mocker,
  });
  context.app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await context.app.init();
  token = jwt.sign(
    { sub: UUID, email: 'sdd@example.invalid', rol: 'ADMINISTRATIVO' },
    secret,
    { expiresIn: '1h' },
  );
  ajv = new Ajv({
    allErrors: true,
    nullable: true,
    unknownFormats: 'ignore',
    logger: false,
  });
  ajv.addSchema(
    { $id: 'ciunac', components: context.document.components },
    'ciunac',
  );
}, 120000);

afterAll(async () => {
  if (context) await context.app.close();
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function prepare(route) {
  const operation =
    context.document.paths[route.path.replace(/:([^/]+)/g, '{$1}')][
      route.method.toLowerCase()
    ];
  const response = operation.responses[String(route.successStatus)];
  const schema = response?.content?.['application/json']?.schema;
  state.route = route;
  state.calls = [];
  state.permissions = [...route.permissions];
  state.authenticating = route.guards.some((guard) =>
    /JwtAuthGuard|AuthGuard/.test(guard),
  );
  state.reply = schema ? example(schema, context.document) : undefined;
  return {
    operation,
    schema,
    ...requestFixture(route, operation, context.document),
  };
}

function send(route, fixture, credentials = true) {
  let action = request(context.app.getHttpServer())
    [route.method.toLowerCase()](fixture.url)
    .query(fixture.query);
  if (credentials)
    action = action
      .set('x-api-key', process.env.API_KEY)
      .set('Authorization', `Bearer ${token}`);
  if (route.multipart) {
    if (route.controller === 'UploadController')
      action = action.field('nombre', 'documento-sdd');
    action = action.attach(
      'file',
      Buffer.from('n_voucher;monto;fecha_efectiva\nV-SDD;50;20261001'),
      {
        filename:
          route.controller === 'CertificadosController' ? 'sdd.pdf' : 'sdd.csv',
        contentType:
          route.controller === 'CertificadosController'
            ? 'application/pdf'
            : 'text/csv',
      },
    );
  } else if (fixture.body !== undefined) action = action.send(fixture.body);
  return action;
}

for (const route of source.routes) {
  test(`HTTP ${route.operationId}`, async () => {
    const fixture = prepare(route);
    const result = await send(route, fixture);
    const expectedStatus = immutable.test(route.operationId)
      ? 409
      : route.successStatus;
    if (result.status !== expectedStatus)
      throw new Error(
        `${route.operationId}: ${result.status} ${JSON.stringify(result.body)}; request=${JSON.stringify(fixture)}`,
      );
    expect({
      operation: route.operationId,
      status: result.status,
      body: result.body,
    }).toMatchObject({ status: expectedStatus });
    if (expectedStatus === 409) {
      expect(result.body.code).toBe('ACTA_INMUTABLE');
      return;
    }
    if (!fixture.schema) {
      expect(result.text).toBe('');
      return;
    }
    const schema = JSON.parse(
      JSON.stringify(fixture.schema).replace(
        /"#\/components/g,
        '"ciunac#/components',
      ),
    );
    const validate = ajv.compile(schema);
    const value =
      fixture.schema.type === 'string'
        ? result.text
        : ['boolean', 'number'].includes(fixture.schema.type)
          ? JSON.parse(result.text)
          : result.body;
    expect({
      operation: route.operationId,
      errors: validate(value) ? null : validate.errors,
    }).toEqual({ operation: route.operationId, errors: null });
    if (route.serviceCalls.length)
      expect(state.calls.length).toBeGreaterThan(0);
  });
  test(`SEC ${route.operationId}`, async () => {
    const fixture = prepare(route);
    expect(fixture.operation.security).toEqual(security(route));
    if (!route.guards.length) {
      const publicResult = await send(route, fixture, false);
      expect(publicResult.status).toBe(
        immutable.test(route.operationId) ? 409 : route.successStatus,
      );
      return;
    }
    const result = await send(route, fixture, false);
    expect(result.status).toBe(401);
    expect(state.calls).toHaveLength(0);
    if (route.guards.some((guard) => /JwtAuthGuard|AuthGuard/.test(guard))) {
      const missingJwt = await send(route, fixture, false).set(
        'x-api-key',
        process.env.API_KEY,
      );
      expect(missingJwt.status).toBe(401);
      const invalidJwt = await send(route, fixture, false)
        .set('x-api-key', process.env.API_KEY)
        .set('Authorization', 'Bearer invalid-token');
      expect(invalidJwt.status).toBe(401);
      expect(state.calls).toHaveLength(0);
    }
    if (route.permissions.length) {
      state.authenticating = true;
      state.permissions = [];
      const denied = await send(route, fixture);
      expect(denied.status).toBe(403);
      expect(state.calls).toHaveLength(0);
    }
  });
  if (
    !route.multipart &&
    route.parameters.some(
      (parameter) =>
        parameter.binding === 'Body' && parameter.typeFile?.endsWith('.dto.ts'),
    )
  ) {
    test(`DTO ${route.operationId}`, async () => {
      const fixture = prepare(route);
      fixture.body = { ...fixture.body, unexpectedSddProperty: true };
      const result = await send(route, fixture);
      expect(result.status).toBe(400);
      expect(state.calls).toHaveLength(0);
    });
  }
}

function assertSchema(schema, data) {
  const validate = ajv.compile(
    JSON.parse(
      JSON.stringify(schema).replace(/"#\/components/g, '"ciunac#/components'),
    ),
  );
  expect(validate(data) ? null : validate.errors).toBeNull();
}

test('REG EST fecha calendario valida llega como texto al servicio en POST y PATCH', async () => {
  for (const id of [
    'EstudiantesController_create',
    'EstudiantesController_update',
  ]) {
    const route = source.routes.find((item) => item.operationId === id);
    const fixture = prepare(route);
    fixture.body.fechaNacimiento = '2000-02-29';
    assertSchema(
      fixture.operation.requestBody.content['application/json'].schema,
      fixture.body,
    );
    const response = await send(route, fixture);
    expect(response.status).toBe(route.successStatus);
    const dto = state.calls[0].args.at(-1);
    expect(dto.fechaNacimiento).toBe('2000-02-29');
  }
});

test('REG EST fecha invalida nula o ausente no llega a persistencia', async () => {
  for (const id of [
    'EstudiantesController_create',
    'EstudiantesController_update',
  ]) {
    const route = source.routes.find((item) => item.operationId === id);
    for (const date of [
      '2001-02-29',
      '2000-02-30',
      'invalid',
      '2000-01-01T00:00:00Z',
      null,
    ]) {
      const fixture = prepare(route);
      fixture.body.fechaNacimiento = date;
      expect((await send(route, fixture)).status).toBe(400);
      expect(state.calls).toHaveLength(0);
    }
  }
  const route = source.routes.find(
    (item) => item.operationId === 'EstudiantesController_create',
  );
  const fixture = prepare(route);
  delete fixture.body.fechaNacimiento;
  expect((await send(route, fixture)).status).toBe(400);
  expect(state.calls).toHaveLength(0);
});

const q10Minimum = {
  Primer_nombre: 'Ana',
  Primer_apellido: 'Perez',
  Segundo_apellido: 'Prueba',
  Email: 'sdd@example.invalid',
  Codigo_tipo_identificacion: 'PE01',
  Numero_identificacion: '12345678',
  Genero: 'F',
  Fecha_nacimiento: '2000-01-01',
  Telefono: '999999999',
  Celular: '999999999',
  Codigo_programa: 'INGLES',
};
test('SWAGGER Q10 campos opcionales y nulos coinciden con HTTP', async () => {
  for (const optional of [
    {},
    {
      tipoEstudiante: null,
      imgDoc: null,
      codigo: null,
      facultadId: null,
      escuelaId: null,
    },
    { codigo: '0012345678', imgDoc: 'https://example.com/documento.pdf' },
  ]) {
    const route = source.routes.find(
      (item) => item.operationId === 'Q10Controller_register',
    );
    const fixture = prepare(route);
    fixture.body = { ...q10Minimum, ...optional };
    assertSchema(
      fixture.operation.requestBody.content['application/json'].schema,
      fixture.body,
    );
    expect((await send(route, fixture)).status).toBe(201);
  }
});
test('SWAGGER tipos nulos permitidos coinciden con POST y PATCH locales', async () => {
  for (const id of [
    'EstudiantesController_create',
    'EstudiantesController_update',
  ]) {
    const route = source.routes.find((item) => item.operationId === id);
    const fixture = prepare(route);
    fixture.body.tipoEstudiante = null;
    assertSchema(
      fixture.operation.requestBody.content['application/json'].schema,
      fixture.body,
    );
    expect((await send(route, fixture)).status).toBe(route.successStatus);
  }
});
test('SWAGGER ejemplos de alumno nuevo validan contra su requestBody', () => {
  for (const [path, method] of [
    ['/estudiantes', 'post'],
    ['/q10/estudiantes', 'post'],
  ]) {
    const media =
      context.document.paths[path][method].requestBody.content[
        'application/json'
      ];
    for (const example of Object.values(media.examples))
      assertSchema(media.schema, example.value);
  }
});
test('SWAGGER upload DNI no exige nombre y devuelve enlaces', async () => {
  const route = source.routes.find(
    (item) => item.operationId === 'UploadController_uploadFile',
  );
  const fixture = prepare(route);
  const schema =
    fixture.operation.requestBody.content['multipart/form-data'].schema;
  expect(schema.required).toEqual(['file']);
  assertSchema(schema, { file: 'dni.pdf' });
  const response = await request(context.app.getHttpServer())
    .post('/upload/DNIS')
    .set('x-api-key', process.env.API_KEY)
    .attach('file', Buffer.from('%PDF-1.7'), {
      filename: 'dni.pdf',
      contentType: 'application/pdf',
    });
  expect(response.status).toBe(201);
  expect(state.calls[0].args[2]).toBeUndefined();
  expect(response.body).toMatchObject({
    success: true,
    viewLink: expect.any(String),
    downloadLink: expect.any(String),
  });
});
test.each([
  'Q10_UNAVAILABLE',
  'Q10_PERIOD_LOOKUP_FAILED',
  'Q10_CREATED_LOCAL_SYNC_FAILED',
  'Q10_CREATED_PROGRAM_PENDING',
  'Q10_CREATED_INVALID_RESPONSE',
])('SWAGGER error 502 documenta %s', (code) => {
  const schema =
    context.document.paths['/q10/estudiantes'].post.responses['502'].content[
      'application/json'
    ].schema;
  assertSchema(schema, {
    code,
    message: 'Fallo controlado de prueba',
    retryAllowed: false,
  });
});

test('SWAGGER fecha obligatoria solo al crear y con formato date', () => {
  const schemas = context.document.components.schemas;
  expect(schemas.CreateEstudianteDto.required).toContain('fechaNacimiento');
  expect(schemas.UpdateEstudianteDto.required ?? []).not.toContain(
    'fechaNacimiento',
  );
  expect(schemas.CreateEstudianteDto.properties.fechaNacimiento).toMatchObject({
    type: 'string',
    format: 'date',
  });
});

test('DOC metadata has no dangling schema references', () => {
  const document = context.document;
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (value.$ref?.startsWith('#/components/schemas/'))
      expect(
        document.components.schemas[value.$ref.split('/').at(-1)],
      ).toBeDefined();
    Object.values(value).forEach(visit);
  }
  visit(document);
});

test('EMPTY solicitud inexistente conserva 200 sin cuerpo cuando el servicio devuelve null', async () => {
  const route = source.routes.find(
    (item) => item.operationId === 'SolicitudesController_findOne',
  );
  const fixture = prepare(route);
  state.reply = null;
  const response = await send(route, fixture);
  expect(response.status).toBe(200);
  expect(response.text).toBe('');
  const validate = ajv.compile(
    JSON.parse(
      JSON.stringify(fixture.schema).replace(
        /"#\/components/g,
        '"ciunac#/components',
      ),
    ),
  );
  expect(validate(null)).toBe(true);
});
