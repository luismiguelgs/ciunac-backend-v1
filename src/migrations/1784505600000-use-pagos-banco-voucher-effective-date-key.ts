import { MigrationInterface, QueryRunner } from 'typeorm';

interface DuplicatePaymentKeyRow {
  numero_voucher: string;
  fecha_efectiva: string;
  total: string;
}

export class UsePagosBancoVoucherEffectiveDateKey1784505600000
  implements MigrationInterface
{
  name = 'UsePagosBancoVoucherEffectiveDateKey1784505600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "UQ_pagos_banco_numero_voucher"',
    );

    const duplicates = (await queryRunner.query(`
			SELECT
				btrim(numero_voucher) AS numero_voucher,
				fecha_efectiva,
				COUNT(*)::text AS total
			FROM pagos_banco
			WHERE numero_voucher IS NOT NULL
				AND btrim(numero_voucher) <> ''
				AND fecha_efectiva IS NOT NULL
			GROUP BY btrim(numero_voucher), fecha_efectiva
			HAVING COUNT(*) > 1
			LIMIT 20
		`)) as DuplicatePaymentKeyRow[];

    if (duplicates.length > 0) {
      const detail = duplicates
        .map(
          (row) =>
            `${row.numero_voucher} / ${row.fecha_efectiva} (${row.total})`,
        )
        .join(', ');
      throw new Error(
        `No se puede crear el indice unico de voucher y fecha efectiva. Resuelva primero estos duplicados exactos: ${detail}`,
      );
    }

    await queryRunner.query(`
			CREATE UNIQUE INDEX IF NOT EXISTS "UQ_pagos_banco_voucher_fecha_efectiva"
			ON pagos_banco (btrim(numero_voucher), fecha_efectiva)
			WHERE numero_voucher IS NOT NULL
				AND btrim(numero_voucher) <> ''
				AND fecha_efectiva IS NOT NULL
		`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "UQ_pagos_banco_voucher_fecha_efectiva"',
    );
    await queryRunner.query(`
			CREATE UNIQUE INDEX IF NOT EXISTS "UQ_pagos_banco_numero_voucher"
			ON pagos_banco (btrim(numero_voucher))
			WHERE numero_voucher IS NOT NULL
				AND btrim(numero_voucher) <> ''
		`);
  }
}
