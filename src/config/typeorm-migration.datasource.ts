import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { DataSource } from 'typeorm';

if (existsSync('.env')) {
  loadEnvFile('.env');
}

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
