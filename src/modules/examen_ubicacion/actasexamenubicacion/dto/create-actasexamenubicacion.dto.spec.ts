import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateActasexamenubicacionDto } from './create-actasexamenubicacion.dto';

const validatePayload = (payload: Record<string, unknown>) =>
  validate(plainToInstance(CreateActasexamenubicacionDto, payload), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

describe('CreateActasexamenubicacionDto', () => {
  it.each([{ examenId: 123 }, { examenId: '123' }])(
    'acepta un examenId entero positivo: %p',
    async (payload) => {
      await expect(validatePayload(payload)).resolves.toHaveLength(0);
    },
  );

  it.each([
    {},
    { examenId: 0 },
    { examenId: -1 },
    { examenId: 1.5 },
    { examenId: 'no-es-un-numero' },
  ])('rechaza examenId ausente o invalido: %p', async (payload) => {
    const errors = await validatePayload(payload);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('rechaza campos adicionales al contrato examenId', async () => {
    const errors = await validatePayload({
      examenId: 123,
      participantes: [],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('participantes');
  });
});
