const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const { root, absolute } = require('./source.cjs');

const compose = [
  'compose',
  '-p',
  `ciunac-sdd-tests-${process.pid}`,
  '-f',
  absolute('test/sdd/compose.yml'),
];
function docker(args) {
  return spawnSync('docker', [...compose, ...args], {
    cwd: root,
    stdio: 'inherit',
    windowsHide: true,
  });
}
let status = 1;
try {
  const up = docker(['up', '-d', '--wait', '--wait-timeout', '120']);
  if (up.error) throw up.error;
  if (up.status !== 0)
    throw new Error(
      'No se pudieron iniciar las bases aisladas SDD. No se usaran las conexiones del .env.',
    );
  fs.mkdirSync(absolute('artifacts/sdd'), { recursive: true });
  const result = spawnSync(
    process.execPath,
    [
      absolute('node_modules/jest/bin/jest.js'),
      '--config',
      'test/sdd/jest.integration.json',
      '--runInBand',
      '--json',
      '--outputFile=artifacts/sdd/integration-results.json',
    ],
    {
      cwd: root,
      stdio: 'inherit',
      windowsHide: true,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        TZ: 'UTC',
        TEST_POSTGRES_HOST: '127.0.0.1',
        TEST_POSTGRES_PORT: '16543',
        TEST_POSTGRES_USER: 'ciunac_sdd_test',
        TEST_POSTGRES_PASSWORD: 'ciunac-sdd-test-only',
        TEST_POSTGRES_DB: 'ciunac_sdd_test',
        TEST_MONGO_URI: 'mongodb://127.0.0.1:27028/ciunac_sdd_test',
      },
    },
  );
  if (result.error) throw result.error;
  status = result.status ?? 1;
} catch (error) {
  console.error(error.message);
} finally {
  const cleanup = docker(['down', '--remove-orphans']);
  if (cleanup.status !== 0) status = 1;
}
process.exitCode = status;
