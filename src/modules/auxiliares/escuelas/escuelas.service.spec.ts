import { Test, TestingModule } from '@nestjs/testing';
import { EscuelasService } from './escuelas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Escuela } from './entities/escuela.entity';
import { Estudiante } from 'src/modules/principales/estudiantes/entities/estudiante.entity';

describe('EscuelasService', () => {
  let service: EscuelasService;
  let repository: {
    findOne: jest.Mock;
    find: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let estudiantes: { existsBy: jest.Mock };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    estudiantes = { existsBy: jest.fn().mockResolvedValue(false) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EscuelasService,
        { provide: getRepositoryToken(Escuela), useValue: repository },
        { provide: getRepositoryToken(Estudiante), useValue: estudiantes },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<EscuelasService>(EscuelasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each(['PRE', 'POS'] as const)(
    'saves a school with type %s',
    async (tipo) => {
      const dto = { nombre: 'Escuela', facultadId: 3, tipo };
      repository.save.mockResolvedValue({ id: 8, ...dto });

      await expect(service.create(dto)).resolves.toMatchObject({ id: 8, tipo });
      expect(repository.save).toHaveBeenCalledWith(dto);
    },
  );

  it('exposes classifications in catalog queries', async () => {
    const school = { id: 8, tipo: 'PRE' };
    repository.find.mockResolvedValue([school]);
    repository.findOne.mockResolvedValue(school);

    await expect(service.findAll()).resolves.toEqual([school]);
    await expect(service.findOne(8)).resolves.toEqual(school);
  });

  it.each(['PRE', 'POS'] as const)(
    'rejects reclassification to %s when linked students are incompatible',
    async (tipo) => {
      repository.findOne.mockResolvedValue({ id: 8, tipo: null });
      estudiantes.existsBy.mockResolvedValue(true);

      await expect(service.update(8, { tipo })).rejects.toThrow(
        'No se puede cambiar el tipo de la escuela',
      );
      expect(estudiantes.existsBy).toHaveBeenCalledWith({
        escuelaId: 8,
        tipoEstudiante: tipo === 'PRE' ? 'POS' : 'PRE',
      });
      expect(repository.update).not.toHaveBeenCalled();
    },
  );

  it('permits classification with no incompatible PRE/POS students, ignoring PG and null', async () => {
    repository.findOne
      .mockResolvedValueOnce({ id: 8, tipo: null })
      .mockResolvedValueOnce({ id: 8, tipo: 'PRE' });

    await expect(service.update(8, { tipo: 'PRE' })).resolves.toMatchObject({
      tipo: 'PRE',
    });
    expect(estudiantes.existsBy).toHaveBeenCalledWith({
      escuelaId: 8,
      tipoEstudiante: 'POS',
    });
    expect(repository.update).toHaveBeenCalledWith(8, { tipo: 'PRE' });
  });

  it('does not block edits when the type stays the same or is omitted', async () => {
    repository.findOne.mockResolvedValue({ id: 8, tipo: 'PRE' });

    await service.update(8, { tipo: 'PRE' });
    await service.update(8, { nombre: 'Nuevo nombre' });

    expect(estudiantes.existsBy).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledTimes(2);
  });
});
