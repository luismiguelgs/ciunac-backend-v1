import { QueryRunner } from 'typeorm';
import { CreatePasswordResetTokens1787011200000 } from './1787011200000-create-password-reset-tokens';

describe('CreatePasswordResetTokens1787011200000', () => {
  it('creates the token table with unique hashes, one row per user and cascade', async () => {
    const queryRunner = {
      query: jest.fn(),
    } as unknown as QueryRunner;
    const migration = new CreatePasswordResetTokens1787011200000();

    await migration.up(queryRunner);

    const sql = (queryRunner.query as jest.Mock).mock.calls
      .map(([statement]) => statement)
      .join('\n');
    expect(sql).toContain('CREATE TABLE "password_reset_tokens"');
    expect(sql).toContain('DEFAULT gen_random_uuid()');
    expect(sql).toContain('ON DELETE CASCADE');
    expect(sql).toContain('"UQ_password_reset_tokens_usuario_id"');
    expect(sql).toContain('"UQ_password_reset_tokens_token_hash"');
  });

  it('removes indexes before the table on rollback', async () => {
    const queryRunner = {
      query: jest.fn(),
    } as unknown as QueryRunner;
    const migration = new CreatePasswordResetTokens1787011200000();

    await migration.down(queryRunner);

    expect(queryRunner.query).toHaveBeenNthCalledWith(
      1,
      'DROP INDEX IF EXISTS "UQ_password_reset_tokens_token_hash"',
    );
    expect(queryRunner.query).toHaveBeenNthCalledWith(
      3,
      'DROP TABLE IF EXISTS "password_reset_tokens"',
    );
  });
});
