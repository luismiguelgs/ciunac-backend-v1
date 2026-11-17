import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateEscuelaDto } from './create-escuela.dto';
import { UpdateEscuelaDto } from './update-escuela.dto';
import { CreateEstudianteDto } from 'src/modules/principales/estudiantes/dto/create-estudiante.dto';
import { UpdateEstudianteDto } from 'src/modules/principales/estudiantes/dto/update-estudiante.dto';

describe('academic classification DTOs', () => {
  it.each(['PRE', 'POS'])('accepts new schools of type %s', async (tipo) => {
    const dto = plainToInstance(CreateEscuelaDto, {
      nombre: 'Escuela',
      facultadId: 3,
      tipo,
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each([undefined, null, '', 'PG', 'OTRO'])(
    'rejects invalid or missing school type %s',
    async (tipo) => {
      const dto = plainToInstance(CreateEscuelaDto, {
        nombre: 'Escuela',
        facultadId: 3,
        tipo,
      });
      expect(await validate(dto)).not.toHaveLength(0);
    },
  );

  it('allows omission of type on school updates', async () => {
    await expect(
      validate(plainToInstance(UpdateEscuelaDto, { nombre: 'Escuela' })),
    ).resolves.toHaveLength(0);
  });

  it.each([null, '', 'PG', 'OTRO'])(
    'rejects an explicitly invalid school update type %s',
    async (tipo) => {
      expect(
        await validate(plainToInstance(UpdateEscuelaDto, { tipo })),
      ).not.toHaveLength(0);
    },
  );

  it.each(['PRE', 'POS', 'PG', undefined, null])(
    'accepts optional student type %s in create and patch DTOs',
    async (tipoEstudiante) => {
      const create = plainToInstance(CreateEstudianteDto, {
        nombres: 'Ana',
        apellidos: 'Perez',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        celular: '999999999',
        fechaNacimiento: '2000-01-01',
        tipoEstudiante,
      });
      const update = plainToInstance(UpdateEstudianteDto, { tipoEstudiante });
      await expect(validate(create)).resolves.toHaveLength(0);
      await expect(validate(update)).resolves.toHaveLength(0);
    },
  );

  it('rejects a student type outside PRE/POS/PG', async () => {
    expect(
      await validate(
        plainToInstance(UpdateEstudianteDto, { tipoEstudiante: 'OTRO' }),
      ),
    ).not.toHaveLength(0);
  });
});
