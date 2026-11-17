const UUID = 'c65ee499-6495-46ee-83c2-17785423fbaf';
const OBJECT_ID = '671100000000000000000001';

function dereference(schema, document) {
  if (!schema) return {};
  if (schema.$ref)
    return dereference(
      document.components.schemas[schema.$ref.split('/').at(-1)],
      document,
    );
  if (schema.allOf)
    return schema.allOf.reduce(
      (result, item) => {
        const current = dereference(item, document);
        return {
          ...result,
          ...current,
          properties: { ...result.properties, ...current.properties },
        };
      },
      { ...schema, allOf: undefined },
    );
  return schema;
}

function example(schema, document, name = '', depth = 0) {
  const current = dereference(schema, document);
  if (current.example !== undefined) return current.example;
  if (current.enum?.length) return current.enum[0];
  if (current.oneOf || current.anyOf)
    return example((current.oneOf ?? current.anyOf)[0], document, name, depth);
  if (current.type === 'array')
    return depth > 2 ? [] : [example(current.items, document, name, depth + 1)];
  if (current.type === 'object' || current.properties) {
    if (depth > 5) return {};
    return Object.fromEntries(
      (current.required ?? Object.keys(current.properties ?? {}))
        .filter((key) => current.properties?.[key])
        .map((key) => [
          key,
          example(current.properties[key], document, key, depth + 1),
        ]),
    );
  }
  if (current.type === 'integer' || current.type === 'number')
    return Math.max(current.minimum ?? 1, 1);
  if (current.type === 'boolean') return true;
  if (current.type === 'string') {
    if (/^genero$/i.test(name)) return 'F';
    if (name === 'Codigo_tipo_identificacion') return 'PE01';
    if (name === 'token') return 'a'.repeat(43);
    if (current.format === 'date-time') return '2026-10-01T12:00:00.000Z';
    if (current.format === 'date' || /^fecha/i.test(name)) return '2026-10-01';
    if (
      current.format === 'uuid' ||
      /^(docenteId|estudianteId|usuarioId|perfilDocenteId)$/i.test(name)
    )
      return UUID;
    if (current.format === 'email' || /email|correo/i.test(name))
      return 'sdd@example.invalid';
    if (current.format === 'uri' || /url|link/i.test(name))
      return 'https://example.invalid/document.pdf';
    if (/password/i.test(name)) return 'SddPassword123!';
    if (/documento|identificacion|dni/i.test(name)) return '12345678';
    if (name === 'periodo' || name === 'Período') return '2026-10';
    if (name === '_id' || /certificadoId|constanciaId/i.test(name))
      return OBJECT_ID;
    if (/celular|telefono/i.test(name)) return '999999999';
    return 'SDD'.padEnd(Math.max(current.minLength ?? 0, 3), 'x');
  }
  return current.nullable ? null : 'SDD';
}

function requestFixture(route, operation, document) {
  const schema = operation.requestBody?.content?.['application/json']?.schema;
  const body = schema ? example(schema, document) : undefined;
  if (body && /AulasController/.test(route.controller)) {
    body.tipo = 'FISICA';
    body.capacidad = 30;
  }
  const query = {};
  for (const parameter of route.parameters.filter(
    (item) => item.binding === 'Query',
  )) {
    if (!parameter.key) continue;
    const values = {
      estado: '1',
      inicio: '2026-10-01',
      fin: '2026-10-31',
      tipo: '7',
      periodo: '2026-10',
      impreso: 'true',
      docenteId: UUID,
      moduloId: '1',
    };
    query[parameter.key] = values[parameter.key] ?? '1';
  }
  for (const parameter of operation.parameters ?? []) {
    if (
      parameter.in === 'query' &&
      parameter.required &&
      query[parameter.name] === undefined
    )
      query[parameter.name] =
        parameter.name === 'periodo'
          ? '2026-10'
          : example(parameter.schema, document, parameter.name);
  }
  const mongo =
    /Actanotas|Actasexamenubicacion|CertificadosController|Constancias|Solicitudbecas|Textos/.test(
      route.controller,
    );
  const url = route.path.replace(/:([^/]+)/g, (_, key) => {
    if (key === 'folder') return 'CONSTANCIAS';
    if (key === 'estado' && route.controller === 'SolicitudbecasController')
      return 'PENDIENTE';
    if (/email/i.test(key)) return 'sdd@example.invalid';
    if (key === 'rol') return 'ADMINISTRATIVO';
    if (/document|dni/i.test(key)) return '12345678';
    if (key === 'id' && mongo) return OBJECT_ID;
    if (
      /^(docenteId|usuarioId)$/.test(key) ||
      (key === 'id' && /Estudiantes|Docentes|Usuarios/.test(route.controller))
    )
      return UUID;
    return '1';
  });
  return { url, body, query };
}

module.exports = { UUID, OBJECT_ID, dereference, example, requestFixture };
