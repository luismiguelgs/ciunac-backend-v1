import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPeriodoToPagosBanco1784592000000 implements MigrationInterface {
  name = 'AddPeriodoToPagosBanco1784592000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
			ALTER TABLE pagos_banco
			ADD COLUMN periodo varchar(7)
		`);

    await queryRunner.query(`
			UPDATE pagos_banco
			SET periodo = to_char(fecha_efectiva, 'YYYY-MM')
			WHERE fecha_efectiva IS NOT NULL
		`);

    await queryRunner.query(`
			ALTER TABLE pagos_banco
			ADD CONSTRAINT "CK_pagos_banco_periodo_fecha_efectiva"
			CHECK (
				(fecha_efectiva IS NULL AND periodo IS NULL)
				OR (
					fecha_efectiva IS NOT NULL
					AND periodo IS NOT NULL
					AND periodo = to_char(fecha_efectiva, 'YYYY-MM')
				)
			)
		`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
			ALTER TABLE pagos_banco
			DROP CONSTRAINT IF EXISTS "CK_pagos_banco_periodo_fecha_efectiva"
		`);
    await queryRunner.query(`
			ALTER TABLE pagos_banco
			DROP COLUMN IF EXISTS periodo
		`);
  }
}
