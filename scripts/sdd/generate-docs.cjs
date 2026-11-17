const fs = require('node:fs');
const path = require('node:path');
const { absolute, read, walk, discover, security } = require('./source.cjs');

const legacyStories = {
  'EXU-001': 'configurar-rangos',
  'EXU-002': 'programar-cronograma',
  'EXU-003': 'crear-examen',
  'EXU-004': 'incorporar-participantes',
  'EXU-005': 'registrar-resultados',
  'EXU-006': 'cerrar-examen',
  'EXU-007': 'generar-acta',
  'EXU-008': 'consultar-actas',
};
const slug = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const storyPath = (flow) =>
  `docs/specs/historias-usuario/${flow.domain === 'examen_ubicacion' ? 'examen-ubicacion' : flow.domain.replaceAll('_', '-')}/hu-${flow.id.toLowerCase()}-${legacyStories[flow.id] ?? slug(flow.title)}.md`;
const link = (from, destination) =>
  path.posix.relative(path.posix.dirname(from), destination);
const code = (value) => `\u0060${value}\u0060`;
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

function buildDocuments({
  source = discover(),
  catalogue = JSON.parse(read('docs/specs/flows.json')),
  openapi = JSON.parse(read('docs/api/openapi.json')),
} = {}) {
  const identifiers = new Set();
  for (const flow of catalogue.flows) {
    if (identifiers.has(flow.id))
      throw new Error(`Identificador duplicado: ${flow.id}`);
    identifiers.add(flow.id);
    if (!fs.existsSync(absolute(`docs/specs/${flow.spec}`)))
      throw new Error(`Spec ausente: ${flow.spec}`);
    for (const criterion of flow.criteria) {
      if (identifiers.has(criterion.id))
        throw new Error(`Identificador duplicado: ${criterion.id}`);
      identifiers.add(criterion.id);
      if (criterion.testFile && !fs.existsSync(absolute(criterion.testFile)))
        throw new Error(`Prueba ausente: ${criterion.testFile}`);
    }
  }
  const operations = source.routes.map((route) => {
    const matches = catalogue.flows.filter(
      (flow) =>
        flow.controller === route.controller &&
        flow.handlers?.includes(route.handler),
    );
    const fallback = catalogue.flows.filter(
      (flow) => flow.controller === route.controller && !flow.handlers,
    );
    const selected = matches.length ? matches : fallback;
    if (selected.length !== 1)
      throw new Error(`Caso de uso ambiguo o ausente: ${route.operationId}`);
    return {
      ...route,
      storyId: `HU-${selected[0].id}`,
      useCaseId: `CU-${selected[0].id}`,
      requirementId: `RF-${selected[0].id}`,
      acceptanceIds: selected[0].criteria.map((criterion) => criterion.id),
      contractTest: `HTTP ${route.operationId}`,
      securityTest: `SEC ${route.operationId}`,
    };
  });
  const stories = catalogue.flows.map((flow) => {
    const routes = operations.filter(
      (route) => route.storyId === `HU-${flow.id}`,
    );
    if (!routes.length)
      throw new Error(
        `Historia sin operaciones: ${flow.id}. Revisar controller/handlers en flows.json.`,
      );
    const serviceFiles = [
      ...new Set(
        routes.flatMap((route) => route.serviceCalls.map((call) => call.file)),
      ),
    ];
    const dataFiles = [
      ...new Set(
        serviceFiles.flatMap((file) => {
          const directory = path.posix.dirname(file);
          return [
            ...read(file).matchAll(/from ['"]([^'"]+(?:entity|schema))['"]/g),
          ].map((match) =>
            match[1].startsWith('src/')
              ? `${match[1]}.ts`
              : path.posix.normalize(`${directory}/${match[1]}.ts`),
          );
        }),
      ),
    ];
    return {
      ...flow,
      storyId: `HU-${flow.id}`,
      useCaseId: `CU-${flow.id}`,
      requirementId: `RF-${flow.id}`,
      storyFile: storyPath(flow),
      serviceFiles,
      dataFiles,
      operationIds: routes.map((route) => route.operationId),
      criteria: flow.criteria.map((criterion) => ({
        ...criterion,
        state: 'Implementado',
        testFile: criterion.testFile ?? 'test/sdd/contracts.contract-spec.cjs',
        testNames:
          criterion.testNames ??
          routes.map(
            (route) =>
              `${criterion.kind === 'security' ? 'SEC' : 'HTTP'} ${route.operationId}`,
          ),
      })),
    };
  });
  const modules = source.modules.map((module) => {
    const flow = stories.find((story) =>
      story.serviceFiles.some(
        (file) => path.posix.dirname(file) === path.posix.dirname(module.file),
      ),
    );
    if (!flow) throw new Error(`Modulo sin spec: ${module.name}`);
    return { ...module, spec: `docs/specs/${flow.spec}` };
  });
  const registry = {
    schemaVersion: 1,
    scope: 'AS-IS',
    owner: 'Equipo tecnico CIUNAC',
    counts: {
      modules: source.modules.length,
      controllers: source.controllers.length,
      operations: operations.length,
      stories: stories.length,
    },
    verification: {
      command: 'npm run sdd:check',
      evidence: 'artifacts/sdd/verification.json',
      note: 'Implementado no equivale a Verificado. Solo el reporte de una ejecucion completa acredita las pruebas y el commit/directorio evaluado.',
    },
    modules,
    stories,
    operations,
  };
  const generated = new Map([['docs/specs/traceability.json', json(registry)]]);
  const inventory = [
    '# Inventario Verificable de Endpoints',
    '',
    'Generado por `npm run docs:update` desde decoradores TypeScript y OpenAPI. Editar los controladores y las specs; no mantener rutas duplicadas a mano.',
    '',
    `Modulos: **${source.modules.length}**. Controladores: **${source.controllers.length}**. Operaciones: **${operations.length}**.`,
    '',
    'Las rutas son relativas al backend. No existe prefijo global `/api/ciunac`; cualquier prefijo adicional pertenece al proxy o al cliente.',
    '',
  ];
  for (const domain of [
    ...new Set(operations.map((route) => route.domain)),
  ].sort()) {
    inventory.push(
      `## ${domain}`,
      '',
      '| Metodo | Ruta | Seguridad | Entrada | Respuesta HTTP | operationId / Caso |',
      '| --- | --- | --- | --- | --- | --- |',
    );
    for (const route of operations.filter((item) => item.domain === domain)) {
      const operation =
        openapi.paths[route.path.replace(/:([^/]+)/g, '{$1}')][
          route.method.toLowerCase()
        ];
      inventory.push(
        `| ${route.method} | ${code(route.path)} | ${Object.keys(security(route)[0] ?? {}).join(' + ') || 'Publico'}${route.permissions.length ? `; ${route.permissions.join(', ')}` : ''} | ${route.multipart ? 'multipart/form-data; ' : ''}${
          route.parameters
            .filter((parameter) =>
              ['Body', 'Param', 'Query'].includes(parameter.binding),
            )
            .map(
              (parameter) =>
                `${parameter.binding} ${parameter.key || parameter.type.replaceAll('|', '/')}`,
            )
            .join('; ') || 'Sin parametros'
        } | ${Object.keys(operation.responses).join(', ')} | ${code(route.operationId)} / ${route.useCaseId} |`,
      );
    }
    inventory.push('');
  }
  generated.set('docs/api/endpoints.md', `${inventory.join('\n').trimEnd()}\n`);
  const index = [
    '# Indice de Historias y Casos de Uso',
    '',
    'Generado desde `flows.json`, los controladores y OpenAPI. Cada caso documenta el comportamiento actual; las propuestas estan en [Backlog funcional](backlog.md).',
    '',
    '| Historia / Caso | Dominio | Proceso | Estado documental |',
    '| --- | --- | --- | --- |',
  ];
  for (const story of stories) {
    index.push(
      `| [${story.storyId} / ${story.useCaseId}](${link('docs/specs/use-cases-index.md', story.storyFile)}) | ${story.domain} | ${story.title} | Implementado; evidencia en reporte SDD |`,
    );
    const file = story.storyFile;
    const routes = operations.filter((route) =>
      story.operationIds.includes(route.operationId),
    );
    const lines = [
      `# ${story.storyId}: ${story.title}`,
      '',
      '<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->',
      '',
      '## Identificacion y estado',
      '',
      `- Caso: ${story.useCaseId}. Requisito: ${story.requirementId}. Version: ${story.version}. Responsable: ${story.owner}.`,
      '- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.',
      `- Especificacion: [${story.spec}](${link(file, `docs/specs/${story.spec}`)}).`,
      '',
      '## Historia y objetivo',
      '',
      story.story,
      '',
      story.objective,
      '',
      '## Actores y precondiciones',
      '',
      `- Actor: ${story.actor}; frontend CIUNAC como cliente HTTP.`,
      '- Persistencia y catalogos relacionados disponibles cuando el servicio los utiliza.',
      `- Autenticacion: ${[...new Set(routes.map((route) => Object.keys(security(route)[0] ?? {}).join(' + ') || 'publica'))].join('; ')}. Los permisos por operacion se detallan en la tabla.`,
      '',
      '## Flujo principal',
      '',
      '1. El frontend recoge los datos del proceso y aplica las validaciones de presentacion.',
      '2. Invoca una de las operaciones del contrato siguiente; el backend aplica sus guards, pipes e interceptores reales.',
      `3. Ejecuta ${[...new Set(routes.flatMap((route) => route.serviceCalls.map((call) => code(call.method))))].join(', ') || 'el handler del controlador'} y devuelve el resultado actual.`,
      '4. El frontend interpreta el codigo y body documentados, actualiza la vista y evita duplicar acciones con efectos externos.',
      '',
      '## Contratos API',
      '',
      '| Metodo / Ruta | operationId | Entrada | Seguridad / permiso | Respuestas |',
      '| --- | --- | --- | --- | --- |',
    ];
    for (const route of routes) {
      const operation =
        openapi.paths[route.path.replace(/:([^/]+)/g, '{$1}')][
          route.method.toLowerCase()
        ];
      lines.push(
        `| ${code(`${route.method} ${route.path}`)} | ${code(route.operationId)} | ${route.multipart ? 'multipart; ' : ''}${
          route.parameters
            .filter((parameter) =>
              ['Body', 'Param', 'Query'].includes(parameter.binding),
            )
            .map(
              (parameter) =>
                `${parameter.binding}: ${parameter.key || parameter.type.replaceAll('|', '/')}`,
            )
            .join('; ') || 'Sin body'
        } | ${Object.keys(security(route)[0] ?? {}).join(' + ') || 'Publica'} ${route.permissions.join(', ')} | ${Object.keys(operation.responses).join(', ')} |`,
      );
    }
    lines.push(
      '',
      `Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](${link(file, 'docs/api/openapi.json')}).`,
      '',
      '## Alternativas, errores y reglas',
      '',
      '- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.',
      '- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.',
      '- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.',
      '- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.',
      `- Las propuestas no implementadas se mantienen en [Backlog](${link(file, 'docs/specs/backlog.md')}).`,
      '',
      '## Datos e integraciones',
      '',
    );
    lines.push(
      ...(story.dataFiles.length
        ? story.dataFiles.map((data) => `- [${data}](${link(file, data)}).`)
        : [
            '- Sin entidad propia; el detalle de dependencias externas se encuentra en la especificacion del dominio.',
          ]),
    );
    lines.push('', '## Criterios de aceptacion y evidencia', '');
    for (const criterion of story.criteria)
      lines.push(
        `- **${criterion.id}**: ${criterion.description} Evidencia: [${criterion.testFile}](${link(file, criterion.testFile)}), ${criterion.testNames.map(code).join(', ')}.`,
      );
    lines.push(
      '',
      `Limite de evidencia: ${story.verificationLimits}`,
      '',
      '## Responsabilidades frontend/backend',
      '',
      '- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.',
      '- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.',
      '- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.',
      '',
      '## Trazabilidad tecnica',
      '',
    );
    for (const sourceFile of [
      ...new Set([
        ...routes.map((route) => route.controllerFile),
        ...story.serviceFiles,
        ...routes.flatMap((route) =>
          route.parameters
            .map((parameter) => parameter.typeFile)
            .filter(Boolean),
        ),
      ]),
    ])
      lines.push(`- [${sourceFile}](${link(file, sourceFile)}).`);
    generated.set(file, `${lines.join('\n')}\n`);
  }
  index.push(
    '',
    '## Verificacion',
    '',
    '`npm run docs:check` exige cobertura bidireccional de modulos, controladores, operaciones e historias y rechaza referencias rotas. `npm run sdd:check` ejecuta las pruebas; sus resultados quedan en `artifacts/sdd/verification.json`.',
    '',
  );
  generated.set('docs/specs/use-cases-index.md', index.join('\n'));
  const moduleRows = source.modules
    .map((module) => `| ${module.name} | ${code(module.file)} |`)
    .join('\n');
  generated.set(
    'docs/architecture/module-inventory.md',
    `# Inventario de Modulos\n\nGenerado desde decoradores NestJS: ${source.modules.length} modulos funcionales, sin contar AppModule. Incluye certificadosr y tiempos.\n\n| Modulo | Implementacion |\n| --- | --- |\n${moduleRows}\n`,
  );
  return { generated, registry };
}

function checkLinks() {
  const problems = [];
  for (const file of walk('docs').filter((item) => item.endsWith('.md'))) {
    for (const match of read(file).matchAll(/(?<!!)\[[^\]]*\]\(([^)]+)\)/g)) {
      const destination = match[1].split('#')[0].replace(/^<|>$/g, '');
      if (
        !destination ||
        /^[a-z]+:\/\//i.test(destination) ||
        destination.startsWith('/')
      )
        continue;
      if (
        !fs.existsSync(
          path.resolve(absolute(path.posix.dirname(file)), destination),
        )
      )
        problems.push(`${file}: ${destination}`);
    }
  }
  if (problems.length)
    throw new Error(`Enlaces rotos:\n${problems.join('\n')}`);
}

if (require.main === module) {
  try {
    const { generated, registry } = buildDocuments();
    for (const [file, content] of generated) {
      if (process.argv.includes('--write')) {
        fs.mkdirSync(path.dirname(absolute(file)), { recursive: true });
        fs.writeFileSync(absolute(file), content);
      } else if (
        !fs.existsSync(absolute(file)) ||
        read(file).replace(/\r\n/g, '\n') !== content
      )
        throw new Error(
          `${file} desactualizado. Ejecutar npm run docs:update y revisar cambios.`,
        );
    }
    checkLinks();
    console.log(
      `SDD: ${JSON.stringify(registry.counts)}. Inventario, historias y enlaces alineados.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { buildDocuments, checkLinks };
