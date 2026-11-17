import { OpenAPIObject } from '@nestjs/swagger';
import { getMetadataArgsStorage } from 'typeorm';
import { CertificadoSchema } from '../modules/administrativas/certificados/schemas/certificado.schema';
import { ConstanciaSchema } from '../modules/administrativas/constancias/schemas/constancia.schema';
import { SolicitudBecaSchema } from '../modules/administrativas/solicitudbecas/schemas/solicitudbeca.schema';
import { ActaNotaSchema } from '../modules/calificaciones/actanotas/schemas/actanota.schema';
import { TextoSchema } from '../modules/auxiliares/textos/schemas/texto.schema';

type Schema = NonNullable<
  NonNullable<OpenAPIObject['components']>['schemas']
>[string];
type ReferenceObject = Extract<Schema, { $ref: string }>;
type SchemaObject = Exclude<Schema, { $ref: string }>;
const text: SchemaObject = { type: 'string' };
const number: SchemaObject = { type: 'number' };
const boolean: SchemaObject = { type: 'boolean' };
const date: SchemaObject = { type: 'string', format: 'date-time' };
const array = (items: Schema): SchemaObject => ({ type: 'array', items });
const object = (
  properties: Record<string, Schema>,
  required = Object.keys(properties),
): SchemaObject => ({ type: 'object', properties, required });
const ref = (name: string): ReferenceObject => ({
  $ref: `#/components/schemas/${name}`,
});
const nullable = (schema: Schema): SchemaObject => ({
  oneOf: [schema, { type: 'object', nullable: true, enum: [null] }],
});
const numbers = (...names: string[]): Record<string, Schema> =>
  Object.fromEntries(names.map((name) => [name, number]));
const message = object({ message: text });
const identity = object({ id: text, email: text, rol: text });

const notification = object(
  {
    estado: { type: 'string', enum: ['ENVIADA', 'NO_ENVIADA', 'NO_APLICA'] },
    motivo: {
      type: 'string',
      enum: ['ESTUDIANTE_SIN_EMAIL', 'ERROR_ENVIO', 'YA_RECHAZADA'],
    },
  },
  ['estado'],
);
const file = object(
  {
    id: text,
    name: text,
    viewLink: text,
    downloadLink: text,
    folder: text,
    modifiedTime: text,
  },
  ['id', 'name', 'viewLink', 'downloadLink', 'folder'],
);
const signedFile = object(
  {
    success: boolean,
    fileId: text,
    name: text,
    viewLink: text,
    originalTrashed: boolean,
    warning: text,
  },
  ['success', 'fileId', 'name', 'viewLink', 'originalTrashed'],
);
const certificateRow = object({
  numeroRegistro: text,
  tipo: text,
  alumno: text,
  idioma: text,
  nivel: text,
  periodo: { ...text, nullable: true },
  numeroVoucher: { ...text, nullable: true },
});
const byFormat = object({
  digitales: array(certificateRow),
  fisicos: array(certificateRow),
});
const courses = array(
  object(
    {
      Codigo: text,
      Nombre_periodo: text,
      Codigo_asignatura: text,
      Numero_identificacion_docente: text,
    },
    [],
  ),
);

const responses: Record<string, Schema> = {
  AppController_getHello: text,
  AppController_login: text,
  AppController_validar: nullable(
    object({ sub: number, username: text, iat: number, exp: number }, [
      'sub',
      'username',
      'iat',
    ]),
  ),
  AppController_getProfile: identity,
  AuthController_register: text,
  AuthController_login: object({ access_token: text, user: ref('Usuario') }),
  AuthController_forgotPassword: message,
  AuthController_resetPassword: message,
  AuthController_logout: object({ ok: boolean, message: text }),
  AuthController_getProfile: object({ message: text, user: identity }),
  EstudiantesController_create: ref('Estudiante'),
  EstudiantesController_remove: message,
  SolicitudesController_reject: object({
    solicitud: ref('Solicitud'),
    notificacion: notification,
  }),
  ConstanciasController_procesarFirma: signedFile,
  CertificadosController_subirArchivo: object(
    { success: boolean, ...file.properties },
    ['success', ...(file.required ?? [])],
  ),
  CertificadosController_procesarFirma: signedFile,
  CertificadosrController_findAll: object({
    basico: byFormat,
    intermedioAvanzado: byFormat,
  }),
  TiemposController_findAll: array(
    object({
      certificadoId: text,
      solicitudId: number,
      tipoSolicitud: text,
      periodo: text,
      formatoCertificado: { type: 'string', enum: ['DIGITAL', 'FISICO'] },
      fechaSolicitud: date,
      fechaEmision: date,
      tiempoHoras: number,
    }),
  ),
  PagosBancoController_uploadFile: object({
    message: text,
    resumen: object(
      numbers(
        'registrosLeidos',
        'pagosRegistrados',
        'duplicadosOmitidos',
        'vouchersSinSolicitud',
        'solicitudesPagadas',
        'solicitudesObservadas',
        'solicitudesObservadasPorVoucherReutilizado',
        'vouchersVerificadosSinCambio',
        'estadosDesconocidos',
        'pagosPreviosReverificados',
      ),
    ),
  }),
  PagosBancoController_reverify: object({
    message: text,
    resumen: object(
      numbers(
        'pagosEvaluados',
        'pagosVerificados',
        'solicitudesPagadas',
        'solicitudesObservadas',
        'solicitudesObservadasPorVoucherReutilizado',
        'vouchersSinSolicitud',
        'estadosSinCambio',
        'estadosDesconocidos',
      ),
    ),
  }),
  DashboardDocentesController_getMetricasGlobales: object(
    numbers(
      'moduloId',
      'promedio',
      'docentesEvaluados',
      'encuestasRealizadas',
      'encuestasPeriodoAnterior',
      'docentesActivos',
    ),
  ),
  DashboardDocentesController_getDesempeñoGeneral: object(
    numbers(
      'moduloId',
      'promedioGeneral',
      'excelente',
      'bueno',
      'regular',
      'deficiente',
      'totalEvaluados',
    ),
  ),
  DashboardDocentesController_getPerfilProfesional: object(
    numbers(
      'licenciatura',
      'maestria',
      'doctorado',
      'b2',
      'c1',
      'c2',
      'promedioHorasCapacitacion',
    ),
  ),
  DashboardDocentesController_getCumplimiento: object(
    numbers('promedioPuntaje'),
  ),
  DashboardDocentesController_getGestionMetodologica: object(
    numbers('promedioPuntaje'),
  ),
  DashboardDocentesController_getValoracionEstudiantil: array(
    object({ dimension: text, promedio: number }),
  ),
  PerfilDocenteResultadosController_getDetalleEvaluacion: object({
    modulo: text,
    docenteId: text,
    promediosGrupos: array(object({ grupo: text, promedio: text })),
    cumplimiento: array(
      object({
        cumplimientoId: number,
        rubroId: number,
        rubro: text,
        puntaje: number,
        peso: number,
        puntajePonderado: text,
      }),
    ),
    encuestaMetricas: nullable(ref('EncuestaMetricasDocente')),
  }),
  Q10Controller_listarHorariosCursos: courses,
  Q10Controller_guardarHorariosCursos: object({
    message: text,
    data: array(ref('Grupo')),
  }),
  UploadController_uploadFile: object(
    { success: boolean, ...file.properties },
    ['success', ...(file.required ?? [])],
  ),
  MailerController_sendMail: message,
  EncuestaRespuestasController_uploadFile: object({
    success: boolean,
    message: text,
  }),
};

// Nullable TypeScript unions are emitted as bare objects by the Nest compiler plugin.
const models: Record<string, string> = {
  ActanotasController: 'ActaNota',
  AulasController: 'Aula',
  CalificacionesubicacionController: 'Calificacionesubicacion',
  CertificadosController: 'Certificado',
  CiclosController: 'Ciclo',
  ConstanciasController: 'Constancia',
  CronogramaubicacionController: 'Cronogramaubicacion',
  DetallesubicacionController: 'Detallesubicacion',
  DocentesController: 'Docente',
  EncuestaMetricasDocenteController: 'EncuestaMetricasDocente',
  EscuelasController: 'Escuela',
  EstadosController: 'Estado',
  EstudiantesController: 'Estudiante',
  EvaluacionesController: 'Evaluacion',
  ExamenesubicacionController: 'Examenesubicacion',
  FacultadesController: 'Facultad',
  GruposController: 'Grupo',
  IdiomasController: 'Idioma',
  ModulosController: 'Modulo',
  NivelesController: 'Nivel',
  NotasController: 'Nota',
  NotasfinalController: 'Notasfinal',
  SolicitudbecasController: 'SolicitudBeca',
  SolicitudesController: 'Solicitud',
  TextosController: 'Texto',
  TipossolicitudController: 'Tipossolicitud',
  UsuariosController: 'Usuario',
};
const empty = new Set([
  'AulasController_remove',
  'EscuelasController_remove',
  'FacultadesController_remove',
  'GruposController_remove',
  'IdiomasController_remove',
  'ModulosController_remove',
  'NivelesController_remove',
  'PagosBancoController_remove',
  'RolPermisosController_remove',
  'UsuariosController_remove',
]);
const errors: Record<string, string[]> = {
  AuthController_register: ['400', '404', '409'],
  AuthController_login: ['401'],
  AuthController_resetPassword: ['400'],
  SolicitudesController_reject: ['400', '404', '500'],
  ActasexamenubicacionController_create: ['400', '404', '409', '500'],
  ActasexamenubicacionController_findOne: ['400', '404'],
  CertificadosController_subirArchivo: ['400', '404', '500'],
  CertificadosController_procesarFirma: ['400', '404', '500'],
  ConstanciasController_procesarFirma: ['400', '404', '500'],
  PagosBancoController_uploadFile: ['400', '500'],
  PagosBancoController_reverify: ['500'],
  MailerController_sendMail: ['500'],
};

export function completeResponseContracts(
  document: OpenAPIObject,
): OpenAPIObject {
  const schemas = document.components?.schemas ?? {};
  const mongoSchemas = {
    Certificado: CertificadoSchema,
    Constancia: ConstanciaSchema,
    SolicitudBeca: SolicitudBecaSchema,
    ActaNota: ActaNotaSchema,
    Texto: TextoSchema,
  };
  for (const [name, model] of Object.entries(mongoSchemas)) {
    const schema = schemas[name];
    if (!schema || '$ref' in schema) continue;
    schema.required = [];
    model.eachPath((field, path) => {
      if (field === '__v' || field === '_id') return;
      schema.properties ??= {};
      const current = schema.properties[field] ?? {};
      const nullable = path.options.default === null;
      if (!('$ref' in current))
        schema.properties[field] = {
          ...current,
          ...(nullable ? { nullable: true } : {}),
        };
      if (path.isRequired || (path.options.default !== undefined && !nullable))
        schema.required?.push(field);
    });
  }
  for (const name of ['CreateAulaDto', 'UpdateAulaDto']) {
    const schema = schemas[name];
    if (schema && !('$ref' in schema) && schema.properties) {
      schema.properties.tipo = { type: 'string', enum: ['VIRTUAL', 'FISICA'] };
      if (name === 'CreateAulaDto')
        schema.required = [
          ...new Set([...(schema.required ?? []), 'capacidad']),
        ];
    }
  }
  for (const name of [
    'CreateEstudianteDto',
    'UpdateEstudianteDto',
    'CreateDocenteDto',
    'UpdateDocenteDto',
    'Q10EstudianteDto',
  ]) {
    const schema = schemas[name];
    if (!schema || '$ref' in schema || !schema.properties) continue;
    const gender = name === 'Q10EstudianteDto' ? 'Genero' : 'genero';
    schema.properties[gender] = { type: 'string', enum: ['M', 'F'] };
    if (name.includes('Estudiante') && name !== 'Q10EstudianteDto') {
      schema.required = schema.required?.filter(
        (field) => !['genero', 'imgDoc', 'direccion'].includes(field),
      );
      schema.properties.fechaNacimiento = {
        ...schema.properties.fechaNacimiento,
        type: 'string',
        format: 'date',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        example: '2000-01-01',
        description:
          'Fecha real YYYY-MM-DD, sin conversion de zona horaria. Obligatoria al crear; opcional en PATCH, sin admitir null.',
      };
    }
    if (name === 'Q10EstudianteDto')
      schema.properties.Codigo_tipo_identificacion = {
        type: 'string',
        enum: ['PE01', 'PE02', 'PE03'],
      };
  }
  for (const relation of getMetadataArgsStorage().relations) {
    if (typeof relation.target !== 'function') continue;
    const schema = document.components?.schemas?.[relation.target.name];
    if (schema && !('$ref' in schema))
      schema.required = schema.required?.filter(
        (name) => name !== relation.propertyName,
      );
    if (
      relation.target.name === 'Estudiante' &&
      schema &&
      !('$ref' in schema) &&
      ['facultad', 'escuela', 'usuario'].includes(relation.propertyName)
    ) {
      const property = schema.properties?.[relation.propertyName];
      if (property && !('oneOf' in property))
        schema.properties![relation.propertyName] = nullable(property);
    }
  }
  for (const model of [
    'Certificado',
    'Constancia',
    'ActaNota',
    'Texto',
    'SolicitudBeca',
  ]) {
    const schema = document.components?.schemas?.[model];
    if (schema && !('$ref' in schema)) {
      schema.properties ??= {};
      schema.properties._id = {
        type: 'string',
        description: 'Identificador MongoDB serializado.',
      };
      schema.properties.id = {
        type: 'string',
        description: 'Alias de identificador cuando el servicio lo incluye.',
      };
    }
  }
  for (const column of getMetadataArgsStorage().columns) {
    if (typeof column.target !== 'function') continue;
    const schema = document.components?.schemas?.[column.target.name];
    if (
      schema &&
      !('$ref' in schema) &&
      schema.properties?.[column.propertyName]
    ) {
      if (
        column.options.type === Number ||
        ['int', 'integer', 'float', 'double precision'].includes(
          String(column.options.type),
        )
      )
        schema.properties[column.propertyName] = { type: 'number' };
      if (
        !column.options.transformer &&
        ['decimal', 'numeric'].includes(String(column.options.type))
      )
        schema.properties[column.propertyName] = {
          type: 'string',
          description: 'Decimal PostgreSQL serializado como texto.',
          ...(column.options.nullable ? { nullable: true } : {}),
        };
      if (column.options.type === 'date')
        schema.properties[column.propertyName] = {
          type: 'string',
          format: 'date',
          ...(column.options.nullable ? { nullable: true } : {}),
        };
      if (column.options.nullable) {
        schema.required = schema.required?.filter(
          (name) => name !== column.propertyName,
        );
        const property = schema.properties[column.propertyName];
        if (!('$ref' in property))
          schema.properties[column.propertyName] = {
            ...property,
            nullable: true,
            ...('enum' in property && property.enum
              ? { enum: [...(property.enum as unknown[]), null] }
              : {}),
          };
      }
    }
  }
  const result = schemas.PerfilDocenteResultado;
  if (result && !('$ref' in result) && result.properties) {
    result.properties.perfilDocenteId = {
      oneOf: [{ type: 'integer' }, { type: 'string', pattern: '^[0-9]+$' }],
      description:
        'FK serial numerica al consultar PostgreSQL; algunas escrituras conservan el texto del DTO en la respuesta inmediata.',
    };
  }
  for (const item of Object.values(document.paths)) {
    for (const [method, operation] of Object.entries(item ?? {})) {
      if (
        !operation ||
        typeof operation !== 'object' ||
        !('operationId' in operation)
      )
        continue;
      const op = operation as NonNullable<typeof item.get>;
      const id = op.operationId ?? '';
      for (const status of errors[id] ?? [])
        op.responses[status] ??= {
          description:
            'Error AS-IS del flujo; causas y codigos de negocio en la especificacion enlazada.',
        };
      const [controller] = id.split('_');
      if (/ActasexamenubicacionController_(update|remove)/.test(id)) {
        op.responses = {
          '409': {
            description:
              'ACTA_INMUTABLE: las actas no se modifican ni eliminan.',
          },
          ...Object.fromEntries(
            Object.entries(op.responses).filter(
              ([code]) => !code.startsWith('2'),
            ),
          ),
        };
        continue;
      }
      const status =
        Object.keys(op.responses).find((code) => code.startsWith('2')) ??
        (method === 'post' ? '201' : '200');
      if (empty.has(id)) {
        op.responses[status] = {
          description: 'Operacion completada; respuesta sin cuerpo.',
        };
        continue;
      }
      let schema = responses[id];
      const response = op.responses[status];
      const existing =
        response && !('$ref' in response)
          ? response.content?.['application/json']?.schema
          : undefined;
      if (
        !schema &&
        models[controller] &&
        existing &&
        'type' in existing &&
        existing.type === 'object' &&
        !existing.properties
      ) {
        schema = nullable(ref(models[controller]));
      }
      if (schema)
        op.responses[status] = {
          description:
            'Respuesta actual del backend. Si el servicio devuelve null, Nest puede responder sin cuerpo; no se garantiza un JSON null.',
          content: { 'application/json': { schema } },
        };
    }
  }
  return document;
}
