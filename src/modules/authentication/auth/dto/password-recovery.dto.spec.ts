import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ForgotPasswordDto } from './forgot-password.dto';
import { ResetPasswordDto } from './reset-password.dto';

describe('password recovery DTOs', () => {
  it('normalizes a valid recovery email', async () => {
    const dto = plainToInstance(ForgotPasswordDto, {
      email: '  Usuario@CIUNAC.edu.pe  ',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.email).toBe('usuario@ciunac.edu.pe');
  });

  it('rejects an invalid email', async () => {
    const dto = plainToInstance(ForgotPasswordDto, { email: 'invalid' });

    expect(await validate(dto)).not.toHaveLength(0);
  });

  it('accepts a valid reset request', async () => {
    const dto = plainToInstance(ResetPasswordDto, {
      token: 'a'.repeat(43),
      newPassword: 'nueva-clave',
      confirmPassword: 'nueva-clave',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each([
    ['a short password', { newPassword: '1234567' }],
    ['a password longer than bcrypt supports', { newPassword: 'a'.repeat(73) }],
    ['an invalid token', { token: 'invalid token' }],
  ])('rejects %s', async (_case, override) => {
    const dto = plainToInstance(ResetPasswordDto, {
      token: 'a'.repeat(43),
      newPassword: 'nueva-clave',
      confirmPassword: 'nueva-clave',
      ...override,
    });

    expect(await validate(dto)).not.toHaveLength(0);
  });
});
