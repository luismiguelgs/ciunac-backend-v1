import { MigrationInterface, QueryRunner } from 'typeorm';

interface DuplicateVoucherRow {
  numero_voucher: string;
  total: string;
}

export class HardenPagosBancoVouchers1784073600000
  implements MigrationInterface
{
  name = 'HardenPagosBancoVouchers1784073600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const duplicates = (await queryRunner.query(`
			SELECT btrim(numero_voucher) AS numero_voucher, COUNT(*)::text AS total
			FROM pagos_banco
			WHERE numero_voucher IS NOT NULL
				AND btrim(numero_voucher) <> ''
			GROUP BY btrim(numero_voucher)
			HAVING COUNT(*) > 1
			LIMIT 20
		`)) as DuplicateVoucherRow[];

    if (duplicates.length > 0) {
      const detail = duplicates
        .map((row) => `${row.numero_voucher} (${row.total})`)
        .join(', ');
      throw new Error(
        `No se puede crear el índice único de vouchers. Resuelva primero estos duplicados: ${detail}`,
      );
    }

    await queryRunner.query(`
			CREATE UNIQUE INDEX IF NOT EXISTS "UQ_pagos_banco_numero_voucher"
			ON pagos_banco (btrim(numero_voucher))
			WHERE numero_voucher IS NOT NULL
				AND btrim(numero_voucher) <> ''
		`);

    await queryRunner.query(`
			CREATE INDEX IF NOT EXISTS "IDX_solicitudes_numero_voucher"
			ON solicitudes (numero_voucher)
		`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_solicitudes_numero_voucher"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "UQ_pagos_banco_numero_voucher"',
    );
  }
}
