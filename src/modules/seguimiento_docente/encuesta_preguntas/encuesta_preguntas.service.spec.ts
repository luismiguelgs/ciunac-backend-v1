import { Test, TestingModule } from '@nestjs/testing';
import { EncuestaPreguntasService } from './encuesta_preguntas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EncuestaPregunta } from './entities/encuesta_pregunta.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('EncuestaPreguntasService', () => {
  let service: EncuestaPreguntasService;
  let repository: Repository<EncuestaPregunta>;

  const mockEncuestaPregunta = {
    id: 1,
    orden: 1,
    textoPregunta: '¿Qué tan satisfecho está?',
    dimension: 'Satisfacción',
    activo: true,
  };

  const mockRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(pregunta => Promise.resolve({ ...mockEncuestaPregunta, ...pregunta })),
    find: jest.fn().mockResolvedValue([mockEncuestaPregunta]),
    findOneBy: jest.fn().mockImplementation(({ id }) => {
      if (id === 1) return Promise.resolve(mockEncuestaPregunta);
      return Promise.resolve(null);
    }),
    merge: jest.fn().mockImplementation((entity, dto) => Object.assign(entity, dto)),
    remove: jest.fn().mockResolvedValue(mockEncuestaPregunta),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncuestaPreguntasService,
        {
          provide: getRepositoryToken(EncuestaPregunta),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EncuestaPreguntasService>(EncuestaPreguntasService);
    repository = module.get<Repository<EncuestaPregunta>>(getRepositoryToken(EncuestaPregunta));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new question', async () => {
      const dto = { orden: 1, textoPregunta: 'Test' };
      const result = await service.create(dto);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(dto));
    });
  });

  describe('findAll', () => {
    it('should return an array of questions', async () => {
      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalledWith({ order: { orden: 'ASC' } });
      expect(result).toEqual([mockEncuestaPregunta]);
    });
  });

  describe('findOne', () => {
    it('should return a question by id', async () => {
      const result = await service.findOne(1);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockEncuestaPregunta);
    });

    it('should throw NotFoundException if question not found', async () => {
      await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a question', async () => {
      const dto = { textoPregunta: 'Updated Text' };
      const result = await service.update(1, dto);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result.textoPregunta).toBe('Updated Text');
    });
  });

  describe('remove', () => {
    it('should remove a question', async () => {
      const result = await service.remove(1);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.remove).toHaveBeenCalledWith(mockEncuestaPregunta);
      expect(result).toEqual(mockEncuestaPregunta);
    });
  });
});

