require('reflect-metadata');
const { DataSource, getMetadataArgsStorage } = require('typeorm');
const mongoose = require('mongoose');
const { absolute, walk } = require('../../scripts/sdd/source.cjs');
require('tsconfig-paths').register({
  baseUrl: absolute('dist'),
  paths: { 'src/*': ['*'] },
});

const load = (file) =>
  require(absolute(file.replace(/^src\//, 'dist/').replace(/\.ts$/, '.js')));
const classes = {};
for (const file of walk('src').filter((name) => name.endsWith('.entity.ts')))
  Object.assign(classes, load(file));
const entities = getMetadataArgsStorage()
  .tables.map((table) => table.target)
  .filter((target) => typeof target === 'function');

async function databases({ synchronize = true } = {}) {
  const {
    TEST_POSTGRES_HOST,
    TEST_POSTGRES_PORT,
    TEST_POSTGRES_USER,
    TEST_POSTGRES_PASSWORD,
    TEST_POSTGRES_DB,
    TEST_MONGO_URI,
  } = process.env;
  if (
    TEST_POSTGRES_HOST !== '127.0.0.1' ||
    TEST_POSTGRES_PORT !== '16543' ||
    TEST_POSTGRES_DB !== 'ciunac_sdd_test' ||
    TEST_MONGO_URI !== 'mongodb://127.0.0.1:27028/ciunac_sdd_test'
  )
    throw new Error(
      'Solo se permiten las bases aisladas SDD; nunca se lee .env.',
    );
  const pg = new DataSource({
    type: 'postgres',
    host: TEST_POSTGRES_HOST,
    port: Number(TEST_POSTGRES_PORT),
    username: TEST_POSTGRES_USER,
    password: TEST_POSTGRES_PASSWORD,
    database: TEST_POSTGRES_DB,
    entities,
    synchronize,
  });
  await pg.initialize();
  const mongo = await mongoose.createConnection(TEST_MONGO_URI).asPromise();
  let serial = 0;
  const repo = (name) => pg.getRepository(classes[name]);
  async function seed(name, overrides = {}) {
    const repository = repo(name);
    const primary = repository.metadata.primaryColumns[0];
    if (
      primary?.isGenerated &&
      primary.generationStrategy === 'increment' &&
      Number.isInteger(overrides[primary.propertyName])
    ) {
      await pg.query(
        'SELECT setval(pg_get_serial_sequence($1, $2), $3, false)',
        [
          repository.metadata.tableName,
          primary.databaseName,
          overrides[primary.propertyName],
        ],
      );
    }
    const data = {};
    for (const column of repository.metadata.columns) {
      if (
        column.isGenerated ||
        column.isCreateDate ||
        column.isUpdateDate ||
        column.isNullable ||
        column.default !== undefined ||
        column.isVirtual
      )
        continue;
      const type = column.type;
      if (column.enum?.length) data[column.propertyName] = column.enum[0];
      else if (
        type === Date ||
        ['date', 'timestamp', 'timestamptz'].includes(type)
      )
        data[column.propertyName] = new Date('2026-10-01T12:00:00Z');
      else if (type === Boolean || type === 'boolean')
        data[column.propertyName] = false;
      else if (
        type === Number ||
        [
          'integer',
          'int',
          'float',
          'decimal',
          'numeric',
          'double precision',
        ].includes(type)
      )
        data[column.propertyName] = 1;
      else data[column.propertyName] = `SDD-${++serial}`;
    }
    return repository.save(repository.create({ ...data, ...overrides }));
  }
  function model(file, name, schemaName) {
    const exports = load(file);
    return mongo.model(name, exports[schemaName]);
  }
  return { pg, mongo, repo, seed, model, classes };
}

module.exports = { databases, load, classes };
