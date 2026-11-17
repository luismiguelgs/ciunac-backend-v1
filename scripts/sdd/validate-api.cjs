const { security } = require('./source.cjs');

function validateApi(source, document) {
  const operations = Object.entries(document.paths).flatMap(([path, item]) =>
    Object.entries(item)
      .filter(([method]) =>
        ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(
          method,
        ),
      )
      .map(([method, operation]) => ({
        method: method.toUpperCase(),
        path,
        operation,
      })),
  );
  if (operations.length !== source.routes.length)
    throw new Error(
      'OpenAPI y controladores tienen distinto numero de operaciones',
    );
  if (
    new Set(operations.map((item) => item.operation.operationId)).size !==
    operations.length
  )
    throw new Error('operationId duplicado');
  for (const route of source.routes) {
    const found = operations.find(
      (item) => item.operation.operationId === route.operationId,
    );
    if (
      !found ||
      found.path !== route.path.replace(/:([^/]+)/g, '{$1}') ||
      found.method !== route.method
    )
      throw new Error(`Operacion desalineada: ${route.operationId}`);
    const { operation } = found;
    if (JSON.stringify(operation.security) !== JSON.stringify(security(route)))
      throw new Error(
        `Seguridad OpenAPI diferente de los guards: ${route.operationId}`,
      );
    if (
      JSON.stringify(operation['x-permissions']) !==
      JSON.stringify(route.permissions)
    )
      throw new Error(`Permisos OpenAPI diferentes: ${route.operationId}`);
    if (
      route.multipart &&
      !operation.requestBody?.content?.['multipart/form-data']
    )
      throw new Error(`Falta multipart: ${route.operationId}`);
    if (
      route.parameters.some((parameter) => parameter.binding === 'Body') &&
      !operation.requestBody
    )
      throw new Error(`Falta requestBody: ${route.operationId}`);
    for (const parameter of route.parameters.filter(
      (item) => item.binding === 'Param',
    )) {
      if (
        !(operation.parameters ?? []).some(
          (item) =>
            item.in === 'path' && item.name === parameter.key && item.required,
        )
      )
        throw new Error(
          `Falta parametro path: ${route.operationId}/${parameter.key}`,
        );
    }
    const responses = Object.entries(operation.responses);
    if (
      !responses.some(([status]) => status.startsWith('2') || status === '409')
    )
      throw new Error(`Sin respuesta documentada: ${route.operationId}`);
    for (const [, response] of responses) {
      const schema = response.content?.['application/json']?.schema;
      if (schema?.type === 'object' && !schema.properties)
        throw new Error(`Respuesta generica: ${route.operationId}`);
    }
  }
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (
      value.$ref?.startsWith('#/components/schemas/') &&
      !document.components?.schemas?.[value.$ref.split('/').at(-1)]
    )
      throw new Error(`Schema ausente: ${value.$ref}`);
    Object.values(value).forEach(visit);
  }
  visit(document);
  return operations;
}
module.exports = { validateApi };
