import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstudiantesService } from './estudiantes.service';
import { Estudiante } from './entities/estudiante.entity';
import { SyncEstudianteQ10Input } from './interfaces/sync-estudiante-q10.interface';
import { Facultad } from 'src/modules/auxiliares/facultades/entities/facultad.entity';
import { Escuela } from 'src/modules/auxiliares/escuelas/entities/escuela.entity';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

describe('EstudiantesService', () => {
  let service: EstudiantesService;
  let repository: jest.Mocked<Repository<Estudiante>>;
  let facultadRepository: { findOne: jest.Mock };
  let escuelaRepository: { findOne: jest.Mock };

  const syncInput: SyncEstudianteQ10Input = {
    idQ10: 'Q10-001',
    nombres: 'Ana',
    apellidos: 'Perez',
    genero: 'F',
    fechaNacimiento: new Date('2000-01-01'),
    tipoDocumento: 'DNI',
    numeroDocumento: '12345678',
    celular: '999999999',
    direccion: 'Lima',
    email: 'ana@example.com',
  };

  beforeEach(async () => {
    facultadRepository = { findOne: jest.fn() };
    escuelaRepository = { findOne: jest.fn() };
    const repositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudiantesService,
        {
          provide: getRepositoryToken(Estudiante),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(Facultad),
          useValue: facultadRepository,
        },
        {
          provide: getRepositoryToken(Escuela),
          useValue: escuelaRepository,
        },
      ],
    }).compile();

    service = module.get<EstudiantesService>(EstudiantesService);
    repository = module.get(getRepositoryToken(Estudiante));
  });

  it('creates a local student with the Q10 identifier', async () => {
    const created = { id: 'local-uuid', ...syncInput } as Estudiante;
    repository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    repository.create.mockReturnValue(created);
    repository.save.mockResolvedValue(created);

    await expect(service.syncFromQ10(syncInput)).resolves.toBe(created);
    expect(repository.create).toHaveBeenCalledWith(syncInput);
  });

  it('preserves local type and document on a generic PATCH with null', async () => {
    repository.findOne.mockResolvedValue({
      id: 'local-uuid',
      tipoEstudiante: 'PRE',
      imgDoc: 'https://example.com/previous.pdf',
    } as Estudiante);
    const dto = Object.assign(new UpdateEstudianteDto(), {
      tipoEstudiante: null,
      imgDoc: null,
      nombres: 'Ana',
    });

    await service.update('local-uuid', dto);

    expect(repository.update).toHaveBeenCalledWith('local-uuid', {
      nombres: 'Ana',
    });
  });

  it('prevents a generic PATCH from changing a student to an incompatible type', async () => {
    repository.findOne.mockResolvedValue({
      id: 'local-uuid',
      tipoEstudiante: 'PRE',
      escuelaId: 8,
    } as Estudiante);
    escuelaRepository.findOne.mockResolvedValue({ id: 8, tipo: 'PRE' });

    await expect(
      service.update('local-uuid', { tipoEstudiante: 'POS' }),
    ).rejects.toThrow('El tipo de la escuela indicada no coincide');
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('updates an existing student found by document without duplicating it', async () => {
    const existing = {
      id: 'local-uuid',
      numeroDocumento: syncInput.numeroDocumento,
      idQ10: undefined,
    } as Estudiante;
    repository.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(null);
    repository.save.mockImplementation(
      async (student) => student as Estudiante,
    );

    const result = await service.syncFromQ10(syncInput);

    expect(result.id).toBe('local-uuid');
    expect(result.idQ10).toBe(syncInput.idQ10);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('is idempotent for the same document and Q10 identifier', async () => {
    const existing = {
      id: 'local-uuid',
      numeroDocumento: syncInput.numeroDocumento,
      idQ10: syncInput.idQ10,
    } as Estudiante;
    repository.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(existing);
    repository.save.mockImplementation(
      async (student) => student as Estudiante,
    );

    await expect(service.syncFromQ10(syncInput)).resolves.toMatchObject({
      id: 'local-uuid',
      idQ10: syncInput.idQ10,
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('persists academic IDs when creating a local student', async () => {
    const input = { ...syncInput, facultadId: 3, escuelaId: 8 };
    const created = { id: 'local-uuid', ...input } as Estudiante;
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(created);
    repository.save.mockResolvedValue(created);

    await expect(service.syncFromQ10(input)).resolves.toMatchObject({
      facultadId: 3,
      escuelaId: 8,
    });
    expect(repository.create).toHaveBeenCalledWith(input);
    expect(repository.save).toHaveBeenCalledWith(created);
  });

  it.each(['PRE', 'POS', 'PG'] as const)(
    'persists local type %s and document together with idQ10',
    async (tipoEstudiante) => {
      const input = {
        ...syncInput,
        tipoEstudiante,
        imgDoc: 'https://drive.google.com/file/d/documento/view',
      };
      const created = { id: 'local-uuid', ...input } as Estudiante;
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(created);
      repository.save.mockResolvedValue(created);

      await expect(service.syncFromQ10(input)).resolves.toMatchObject(input);
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(input),
      );
    },
  );

  it.each([
    {},
    { tipoEstudiante: null, imgDoc: null },
    { tipoEstudiante: undefined, imgDoc: undefined },
  ])(
    'preserves existing type and document when absent: %j',
    async (localData) => {
      const existing = {
        id: 'local-uuid',
        ...syncInput,
        tipoEstudiante: 'PRE',
        imgDoc: 'https://drive.google.com/file/d/previous/view',
      } as Estudiante;
      repository.findOne.mockResolvedValue(existing);
      repository.save.mockImplementation((value) =>
        Promise.resolve(value as Estudiante),
      );

      await expect(
        service.syncFromQ10({ ...syncInput, ...localData }),
      ).resolves.toMatchObject({
        tipoEstudiante: 'PRE',
        imgDoc: 'https://drive.google.com/file/d/previous/view',
      });
    },
  );

  it('does not manufacture type or document for a new unclassified student', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue({ ...syncInput } as Estudiante);
    repository.save.mockResolvedValue({ ...syncInput } as Estudiante);

    await service.syncFromQ10({
      ...syncInput,
      tipoEstudiante: null,
      imgDoc: null,
    });

    expect(repository.create).toHaveBeenCalledWith(syncInput);
    expect(repository.create.mock.calls[0][0]).not.toHaveProperty(
      'tipoEstudiante',
    );
    expect(repository.create.mock.calls[0][0]).not.toHaveProperty('imgDoc');
  });

  it.each([
    [{}, { facultadId: 3, escuelaId: 8 }],
    [
      { facultadId: null, escuelaId: null },
      { facultadId: 3, escuelaId: 8 },
    ],
    [
      { facultadId: undefined, escuelaId: undefined },
      { facultadId: 3, escuelaId: 8 },
    ],
    [{ facultadId: 4 }, { facultadId: 4, escuelaId: 8 }],
    [{ escuelaId: 9 }, { facultadId: 3, escuelaId: 9 }],
    [
      { facultadId: 4, escuelaId: 9 },
      { facultadId: 4, escuelaId: 9 },
    ],
  ])(
    'updates only provided academic IDs: %j',
    async (academicData, expected) => {
      const existing = {
        id: 'local-uuid',
        ...syncInput,
        facultadId: 3,
        escuelaId: 8,
      } as Estudiante;
      repository.findOne.mockResolvedValue(existing);
      repository.save.mockImplementation((student) =>
        Promise.resolve(student as Estudiante),
      );

      await expect(
        service.syncFromQ10({ ...syncInput, ...academicData }),
      ).resolves.toMatchObject(expected);
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(expected),
      );
    },
  );

  describe('validarFacultadYEscuela', () => {
    it.each(['PRE', 'POS'] as const)(
      'accepts a matching school for %s without a faculty',
      async (tipoEstudiante) => {
        escuelaRepository.findOne.mockResolvedValue({
          id: 8,
          facultadId: 3,
          tipo: tipoEstudiante,
        });

        await expect(
          service.validarFacultadYEscuela({ escuelaId: 8, tipoEstudiante }),
        ).resolves.toBeUndefined();
        expect(facultadRepository.findOne).not.toHaveBeenCalled();
      },
    );

    it.each(['PRE', 'POS'] as const)(
      'rejects an incompatible school for %s',
      async (tipoEstudiante) => {
        escuelaRepository.findOne.mockResolvedValue({
          id: 8,
          facultadId: 3,
          tipo: tipoEstudiante === 'PRE' ? 'POS' : 'PRE',
        });

        await expect(
          service.validarFacultadYEscuela({ escuelaId: 8, tipoEstudiante }),
        ).rejects.toThrow(
          'El tipo de la escuela indicada no coincide con el tipo del estudiante',
        );
      },
    );

    it('requires classification of historical schools for PRE/POS', async () => {
      escuelaRepository.findOne.mockResolvedValue({
        id: 8,
        facultadId: 3,
        tipo: null,
      });

      await expect(
        service.validarFacultadYEscuela({
          escuelaId: 8,
          tipoEstudiante: 'PRE',
        }),
      ).rejects.toThrow('La escuela indicada debe clasificarse');
    });

    it('accepts PG with academic relationships, including an unclassified school', async () => {
      facultadRepository.findOne.mockResolvedValue({ id: 3 });
      escuelaRepository.findOne.mockResolvedValue({
        id: 8,
        facultadId: 3,
        tipo: null,
      });

      await expect(
        service.validarFacultadYEscuela({
          escuelaId: 8,
          facultadId: 3,
          tipoEstudiante: 'PG',
        }),
      ).resolves.toBeUndefined();
    });

    it('uses the stored type and school when omitted in a Q10 request', async () => {
      repository.findOne.mockResolvedValue({
        tipoEstudiante: 'PRE',
        escuelaId: 8,
      });
      escuelaRepository.findOne.mockResolvedValue({
        id: 8,
        facultadId: 3,
        tipo: 'POS',
      });

      await expect(
        service.validarFacultadYEscuela({ numeroDocumento: '12345678' }),
      ).rejects.toThrow('El tipo de la escuela indicada no coincide');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { numeroDocumento: '12345678' },
      });
    });

    it('allows an existing unclassified student without inferring a type', async () => {
      repository.findOne.mockResolvedValue({ tipoEstudiante: null });
      escuelaRepository.findOne.mockResolvedValue({ id: 8, tipo: null });

      await expect(
        service.validarFacultadYEscuela({
          numeroDocumento: '12345678',
          escuelaId: 8,
        }),
      ).resolves.toBeUndefined();
    });

    it('validates a new type against the existing school', async () => {
      repository.findOne.mockResolvedValue({
        tipoEstudiante: null,
        escuelaId: 8,
      });
      escuelaRepository.findOne.mockResolvedValue({ id: 8, tipo: 'PRE' });

      await expect(
        service.validarFacultadYEscuela({
          numeroDocumento: '12345678',
          tipoEstudiante: 'POS',
        }),
      ).rejects.toThrow('El tipo de la escuela indicada no coincide');
    });
    it.each([{}, { facultadId: null, escuelaId: null }])(
      'skips catalog lookups for absent IDs: %j',
      async (input) => {
        await expect(
          service.validarFacultadYEscuela(input),
        ).resolves.toBeUndefined();

        expect(facultadRepository.findOne).not.toHaveBeenCalled();
        expect(escuelaRepository.findOne).not.toHaveBeenCalled();
      },
    );

    it('accepts a school belonging to the provided faculty', async () => {
      facultadRepository.findOne.mockResolvedValue({ id: 3 });
      escuelaRepository.findOne.mockResolvedValue({ id: 8, facultadId: 3 });

      await expect(
        service.validarFacultadYEscuela({ facultadId: 3, escuelaId: 8 }),
      ).resolves.toBeUndefined();
      expect(facultadRepository.findOne).toHaveBeenCalledWith({
        where: { id: 3 },
      });
      expect(escuelaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 8 },
      });
    });

    it('accepts only a faculty without inferring a school', async () => {
      facultadRepository.findOne.mockResolvedValue({ id: 3 });

      await service.validarFacultadYEscuela({ facultadId: 3 });

      expect(escuelaRepository.findOne).not.toHaveBeenCalled();
    });

    it('accepts only a school without inferring a faculty', async () => {
      escuelaRepository.findOne.mockResolvedValue({ id: 8, facultadId: 3 });

      await service.validarFacultadYEscuela({ escuelaId: 8 });

      expect(facultadRepository.findOne).not.toHaveBeenCalled();
    });

    it('rejects an unknown faculty', async () => {
      facultadRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validarFacultadYEscuela({ facultadId: 999 }),
      ).rejects.toThrow('La facultad indicada no existe');
    });

    it('rejects an unknown school', async () => {
      escuelaRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validarFacultadYEscuela({ escuelaId: 999 }),
      ).rejects.toThrow('La escuela indicada no existe');
    });

    it('rejects a school belonging to another faculty', async () => {
      facultadRepository.findOne.mockResolvedValue({ id: 3 });
      escuelaRepository.findOne.mockResolvedValue({ id: 8, facultadId: 4 });

      const promise = service.validarFacultadYEscuela({
        facultadId: 3,
        escuelaId: 8,
      });

      await expect(promise).rejects.toBeInstanceOf(BadRequestException);
      await expect(promise).rejects.toThrow(
        'La escuela indicada no pertenece a la facultad indicada',
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  it('rejects a document already linked to another Q10 identifier', async () => {
    const existing = {
      id: 'local-uuid',
      numeroDocumento: syncInput.numeroDocumento,
      idQ10: 'Q10-OTHER',
    } as Estudiante;
    repository.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(null);

    await expect(service.syncFromQ10(syncInput)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('rejects a Q10 identifier already linked to another student', async () => {
    const otherStudent = {
      id: 'other-uuid',
      numeroDocumento: '87654321',
      idQ10: syncInput.idQ10,
    } as Estudiante;
    repository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(otherStudent);

    await expect(service.syncFromQ10(syncInput)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });
});
