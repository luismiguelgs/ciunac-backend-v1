import { Type, ValidationPipe } from '@nestjs/common';
import { CreateEstudianteDto } from './create-estudiante.dto';
import { UpdateEstudianteDto } from './update-estudiante.dto';

const payload = {
  nombres: 'Ana',
  apellidos: 'Perez',
  genero: 'F',
  tipoDocumento: 'DNI',
  numeroDocumento: '12345678',
  celular: '999999999',
};
const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
});
async function transform<T extends object>(
  metatype: Type<T>,
  value: Record<string, unknown>,
): Promise<T> {
  const result: unknown = await pipe.transform(value, {
    type: 'body',
    metatype,
  });
  return result as T;
}

describe('Fecha de nacimiento de estudiante', () => {
  it.each(['2000-01-01', '2000-02-29', '2004-02-29', '2026-11-06'])(
    'acepta %s como texto calendario en POST y PATCH con conversion implicita activa',
    async (fechaNacimiento) => {
      const create = await transform(CreateEstudianteDto, {
        ...payload,
        fechaNacimiento,
      });
      const patch = await transform(UpdateEstudianteDto, { fechaNacimiento });
      expect(create.fechaNacimiento).toBe(fechaNacimiento);
      expect(patch.fechaNacimiento).toBe(fechaNacimiento);
      expect(typeof create.fechaNacimiento).toBe('string');
    },
  );
  it.each([
    '2001-02-29',
    '2000-02-30',
    '2000-13-01',
    '2000-01-32',
    '2000-1-1',
    '2000-01-01T00:00:00.000Z',
    '',
    'invalid',
    1234,
    null,
  ])('rechaza fecha invalida %s en POST y PATCH', async (fechaNacimiento) => {
    await expect(
      transform(CreateEstudianteDto, { ...payload, fechaNacimiento }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      transform(UpdateEstudianteDto, { fechaNacimiento }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it('exige fecha en POST y permite omitirla en PATCH', async () => {
    await expect(transform(CreateEstudianteDto, payload)).rejects.toMatchObject(
      { status: 400 },
    );
    await expect(
      transform(UpdateEstudianteDto, { nombres: 'Ana' }),
    ).resolves.toMatchObject({ nombres: 'Ana' });
  });
});
