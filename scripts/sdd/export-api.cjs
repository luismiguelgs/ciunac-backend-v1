const fs = require('node:fs');
const { absolute } = require('./source.cjs');
const { createContractApplication } = require('./application.cjs');
const { validateApi } = require('./validate-api.cjs');

function sorted(value) {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sorted(value[key])]),
    );
  return value;
}

async function main() {
  const { app, source, document } = await createContractApplication();
  try {
    const operations = validateApi(source, document);
    document.info.version = require(absolute('package.json')).version;
    const output = `${JSON.stringify(sorted(document), null, 2)}\n`;
    const destination = absolute('docs/api/openapi.json');
    if (process.argv.includes('--check')) {
      if (
        !fs.existsSync(destination) ||
        fs.readFileSync(destination, 'utf8').replace(/\r\n/g, '\n') !== output
      ) {
        throw new Error(
          'OpenAPI desactualizado. Ejecutar npm run api:export y revisar el diff.',
        );
      }
    } else fs.writeFileSync(destination, output);
    console.log(
      `OpenAPI: ${source.controllers.length} controladores, ${operations.length} operaciones; rutas, seguridad y multipart alineados.`,
    );
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
