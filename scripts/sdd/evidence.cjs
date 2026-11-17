const { absolute } = require('./source.cjs');
const normalize = (file) => absolute(file).replaceAll('\\', '/').toLowerCase();

function checkEvidence(registry, results) {
  const passed = new Map();
  for (const result of results) {
    if (!result.success) continue;
    for (const suite of result.testResults) {
      const names = new Set(
        suite.assertionResults
          .filter(
            (test) =>
              test.status === 'passed' &&
              !/should be defined/i.test(test.fullName),
          )
          .map((test) => test.fullName),
      );
      passed.set(normalize(suite.name), names);
    }
  }
  return registry.stories.flatMap((story) =>
    story.criteria.map((criterion) => {
      const names = passed.get(normalize(criterion.testFile)) ?? new Set();
      const missing = criterion.testNames.filter(
        (name) =>
          ![...names].some(
            (fullName) => fullName === name || fullName.endsWith(` ${name}`),
          ),
      );
      return {
        id: criterion.id,
        storyId: story.storyId,
        testFile: criterion.testFile,
        tests: criterion.testNames,
        state: missing.length ? 'Implementado' : 'Verificado',
        missing,
      };
    }),
  );
}
module.exports = { checkEvidence };
