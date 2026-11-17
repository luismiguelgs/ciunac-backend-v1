const fs = require('node:fs');
const { discover, absolute } = require('../../scripts/sdd/source.cjs');
const { buildDocuments } = require('../../scripts/sdd/generate-docs.cjs');
const { validateApi } = require('../../scripts/sdd/validate-api.cjs');
const { checkEvidence } = require('../../scripts/sdd/evidence.cjs');
const source = discover();
const document = JSON.parse(
  fs.readFileSync(absolute('docs/api/openapi.json'), 'utf8'),
);
const catalogue = JSON.parse(
  fs.readFileSync(absolute('docs/specs/flows.json'), 'utf8'),
);
const copy = (value) => JSON.parse(JSON.stringify(value));

test('PARITY cobertura bidireccional de codigo contrato inventario y matriz', () => {
  expect(validateApi(source, document)).toHaveLength(source.routes.length);
  const { registry } = buildDocuments({ source, catalogue, openapi: document });
  expect(registry.counts.operations).toBe(source.routes.length);
  expect(registry.modules).toHaveLength(source.modules.length);
  expect(
    new Set(registry.operations.map((route) => route.controller)).size,
  ).toBe(source.controllers.length);
});
test('PARITY rechaza operaciones nuevas sin historia y referencias eliminadas', () => {
  const added = copy(source);
  added.routes.push({
    ...source.routes[0],
    controller: 'NewController',
    handler: 'newRoute',
    operationId: 'NewController_newRoute',
  });
  expect(() =>
    buildDocuments({ source: added, catalogue, openapi: document }),
  ).toThrow('Caso de uso ambiguo o ausente');
  const removed = copy(catalogue);
  removed.flows[0].controller = 'RemovedController';
  expect(() =>
    buildDocuments({ source, catalogue: removed, openapi: document }),
  ).toThrow();
  const module = copy(source);
  module.modules.push({ name: 'NewModule', file: 'src/new/new.module.ts' });
  expect(() =>
    buildDocuments({ source: module, catalogue, openapi: document }),
  ).toThrow('Modulo sin spec');
});
test('PARITY rechaza diferencias de seguridad body parametros y respuestas', () => {
  for (const mutate of [
    (operation) => {
      operation.security = [];
    },
    (operation) => {
      operation['x-permissions'] = ['invented_permission'];
    },
    (operation) => {
      operation.operationId = 'removed_route';
    },
    (operation) => {
      delete operation.requestBody;
    },
    (operation) => {
      operation.responses['201'].content['application/json'].schema = {
        type: 'object',
      };
    },
    (operation) => {
      operation.responses['201'].content['application/json'].schema = {
        $ref: '#/components/schemas/MissingSchema',
      };
    },
  ]) {
    const changed = copy(document);
    mutate(changed.paths['/solicitudes'].post);
    expect(() => validateApi(source, changed)).toThrow();
  }
  const removed = copy(document);
  delete removed.paths['/solicitudes'].post;
  expect(() => validateApi(source, removed)).toThrow('distinto numero');
  const changed = copy(document);
  changed.paths['/solicitudes/{id}'].get.parameters = [];
  expect(() => validateApi(source, changed)).toThrow('Falta parametro path');
});
test('PARITY detecta IDs duplicados y pruebas inexistentes', () => {
  const duplicate = copy(catalogue);
  duplicate.flows.push(duplicate.flows[0]);
  expect(() =>
    buildDocuments({ source, catalogue: duplicate, openapi: document }),
  ).toThrow('Identificador duplicado');
  const missing = copy(catalogue);
  missing.flows[0].criteria[0].testFile = 'test/does-not-exist.spec.ts';
  expect(() =>
    buildDocuments({ source, catalogue: missing, openapi: document }),
  ).toThrow('Prueba ausente');
});

test('EVIDENCE exige archivo nombre y resultado funcional aprobado', () => {
  const registry = {
    stories: [
      {
        storyId: 'HU-TEST',
        criteria: [
          {
            id: 'CA-TEST',
            testFile: 'test/sdd/contracts.contract-spec.cjs',
            testNames: ['HTTP TestController_read'],
          },
        ],
      },
    ],
  };
  const result = {
    success: true,
    testResults: [
      {
        name: absolute('test/sdd/contracts.contract-spec.cjs'),
        assertionResults: [
          { fullName: 'HTTP TestController_read', status: 'passed' },
        ],
      },
    ],
  };
  expect(checkEvidence(registry, [result])[0].state).toBe('Verificado');
  const wrongFile = copy(result);
  wrongFile.testResults[0].name = absolute('test/wrong.cjs');
  expect(checkEvidence(registry, [wrongFile])[0].missing).toHaveLength(1);
  const failed = copy(result);
  failed.testResults[0].assertionResults[0].status = 'failed';
  expect(checkEvidence(registry, [failed])[0].state).toBe('Implementado');
  const instantiation = copy(registry);
  instantiation.stories[0].criteria[0].testNames = ['should be defined'];
  const defined = copy(result);
  defined.testResults[0].assertionResults[0].fullName =
    'service should be defined';
  expect(checkEvidence(instantiation, [defined])[0].state).toBe('Implementado');
});
