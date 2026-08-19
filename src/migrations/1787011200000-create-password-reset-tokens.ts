import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePasswordResetTokens1787011200000
  implements MigrationInterface
{
  name = 'CreatePasswordResetTokens1787011200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
			CREATE TABLE "password_reset_tokens" (
				"id" uuid NOT NULL DEFAULT gen_random_uuid(),
				"usuario_id" uuid NOT NULL,
				"token_hash" char(64) NOT NULL,
				"expires_at" timestamptz NOT NULL,
				"used_at" timestamptz,
				"created_at" timestamptz NOT NULL DEFAULT now(),
				CONSTRAINT "PK_password_reset_tokens" PRIMARY KEY ("id"),
				CONSTRAINT "FK_password_reset_tokens_usuario"
					FOREIGN KEY ("usuario_id")
					REFERENCES "usuarios"("id")
					ON DELETE CASCADE
			)
		`);

    await queryRunner.query(`
			CREATE UNIQUE INDEX "UQ_password_reset_tokens_usuario_id"
			ON "password_reset_tokens" ("usuario_id")
		`);

    await queryRunner.query(`
			CREATE UNIQUE INDEX "UQ_password_reset_tokens_token_hash"
			ON "password_reset_tokens" ("token_hash")
		`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "UQ_password_reset_tokens_token_hash"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "UQ_password_reset_tokens_usuario_id"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "password_reset_tokens"');
  }
}
