const fs = require('node:fs');
const { spawnSync, execFileSync } = require('node:child_process');
const { root, absolute, walk } = require('./source.cjs');
const { createHash } = require('node:crypto');
const { checkEvidence } = require('./evidence.cjs');
const directory = absolute('artifacts/sdd');
fs.mkdirSync(directory, { recursive: true });
for (const kind of ['unit', 'contract', 'integration', 'e2e']) {
  const file = `${directory}/${kind}-results.json`;
  if (fs.existsSync(file)) fs.unlinkSync(file);
}
function fingerprint() {
  const hash = createHash('sha256');
  const files = ['src', 'docs', 'scripts', 'test', '.github']
    .flatMap(walk)
    .concat([
      'package.json',
      'package-lock.json',
      'nest-cli.json',
      'tsconfig.json',
    ])
    .sort();
  for (const file of files) {
    hash.update(file);
    hash.update(fs.readFileSync(absolute(file)));
  }
  return hash.digest('hex');
}
const initialFingerprint = fingerprint();
const stages = [
  ['build', [absolute('node_modules/@nestjs/cli/bin/nest.js'), 'build']],
  ['api', [absolute('scripts/sdd/export-api.cjs'), '--check']],
  ['docs', [absolute('scripts/sdd/generate-docs.cjs'), '--check']],
  [
    'unit',
    [
      absolute('node_modules/jest/bin/jest.js'),
      '--runInBand',
      '--json',
      '--outputFile=artifacts/sdd/unit-results.json',
    ],
  ],
  [
    'contract',
    [
      absolute('node_modules/jest/bin/jest.js'),
      '--config',
      'test/sdd/jest.contract.json',
      '--runInBand',
      '--json',
      '--outputFile=artifacts/sdd/contract-results.json',
    ],
  ],
  ['integration', [absolute('scripts/sdd/run-integration.cjs')]],
  [
    'e2e',
    [
      absolute('node_modules/jest/bin/jest.js'),
      '--config',
      'test/jest-e2e.json',
      '--runInBand',
      '--json',
      '--outputFile=artifacts/sdd/e2e-results.json',
    ],
  ],
];
const report = {
  startedAt: new Date().toISOString(),
  scope: 'AS-IS',
  state: 'Implementado',
  stages: [],
  evidence: {},
  source: {},
};
let success = true;
for (const [name, args] of stages) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    stdio: 'inherit',
    windowsHide: true,
  });
  report.stages.push({
    name,
    startedAt,
    finishedAt: new Date().toISOString(),
    status: result.status ?? 1,
  });
  if (result.status !== 0) {
    success = false;
    break;
  }
}
try {
  report.source = {
    commit: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
    }).trim(),
    changes: execFileSync('git', ['status', '--porcelain'], {
      cwd: root,
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .filter(Boolean),
  };
} catch {
  report.source = { commit: null };
}
if (success) {
  const registry = JSON.parse(
    fs.readFileSync(absolute('docs/specs/traceability.json'), 'utf8'),
  );
  const results = [];
  for (const kind of ['unit', 'contract', 'integration', 'e2e']) {
    const result = JSON.parse(
      fs.readFileSync(`${directory}/${kind}-results.json`, 'utf8'),
    );
    report.evidence[kind] = {
      success: result.success,
      passed: result.numPassedTests,
      failed: result.numFailedTests,
      suites: result.numPassedTestSuites,
    };
    results.push(result);
    if (!result.success || result.startTime < Date.parse(report.startedAt))
      success = false;
  }
  report.criteria = checkEvidence(registry, results);
  const missing = report.criteria.filter(
    (criterion) => criterion.missing.length,
  );
  if (missing.length) {
    success = false;
    report.missingEvidence = missing;
  }
  report.coverage = registry.counts;
}
report.source.fingerprint = fingerprint();
report.source.unchangedDuringVerification =
  report.source.fingerprint === initialFingerprint;
if (!report.source.unchangedDuringVerification) success = false;
report.state = success ? 'Verificado' : 'Implementado';
report.success = success;
report.finishedAt = new Date().toISOString();
fs.writeFileSync(
  `${directory}/verification.json`,
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(`SDD: ${report.state}. Evidencia: artifacts/sdd/verification.json`);
process.exitCode = success ? 0 : 1;
