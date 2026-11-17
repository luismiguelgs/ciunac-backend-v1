require('reflect-metadata');
const { absolute, discover } = require('./source.cjs');
require('tsconfig-paths').register({
  baseUrl: absolute('dist'),
  paths: { 'src/*': ['*'] },
});
const { Test } = require('@nestjs/testing');

async function createContractApplication({
  providers = [],
  mocker = () => ({}),
} = {}) {
  const source = discover();
  const controllers = source.controllers.map(
    ({ file, name }) =>
      require(
        absolute(file.replace(/^src\//, 'dist/').replace(/\.ts$/, '.js')),
      )[name],
  );
  const module = await Test.createTestingModule({ controllers, providers })
    .useMocker(mocker)
    .compile();
  const app = module.createNestApplication({ logger: false });
  const { createSwaggerDocument } = require(
    absolute('dist/config/swagger.config.js'),
  );
  return { app, module, source, document: createSwaggerDocument(app) };
}

module.exports = { createContractApplication };
