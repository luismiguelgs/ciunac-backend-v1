import { Test, TestingModule } from '@nestjs/testing';
import { EncuestaRespuestasService } from './encuesta_respuestas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EncuestaRespuesta } from './entities/encuesta_respuesta.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('EncuestaRespuestasService', () => {
  let service: EncuestaRespuestasService;
  let repository: Repository<EncuestaRespuesta>;

  const mockEncuestaRespuesta = {
    id: 1,
    grupoId: 10,
    promedioPonderado: 18,
    creadoEn: new Date(),
    modificadoEn: new Date(),
    grupo: { id: 10, codigo: 'G-01' },
  };

  const mockRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(respuesta => Promise.resolve({ ...mockEncuestaRespuesta, ...respuesta })),
    find: jest.fn().mockResolvedValue([mockEncuestaRespuesta]),
    findOne: jest.fn().mockImplementation(({ where: { id } }) => {
      if (id === 1) return Promise.resolve(mockEncuestaRespuesta);
      return Promise.resolve(null);
    }),
    merge: jest.fn().mockImplementation((entity, dto) => Object.assign(entity, dto)),
    remove: jest.fn().mockResolvedValue(mockEncuestaRespuesta),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncuestaRespuestasService,
        {
          provide: getRepositoryToken(EncuestaRespuesta),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EncuestaRespuestasService>(EncuestaRespuestasService);
    repository = module.get<Repository<EncuestaRespuesta>>(getRepositoryToken(EncuestaRespuesta));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new response', async () => {
      const dto = { grupoId: 10, promedioPonderado: 18 };
      const result = await service.create(dto);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(dto));
    });
  });

  describe('findAll', () => {
    it('should return an array of responses', async () => {
      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockEncuestaRespuesta]);
    });
  });

  describe('findOne', () => {
    it('should return a response by id', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockEncuestaRespuesta);
    });

    it('should throw NotFoundException if response not found', async () => {
      await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a response', async () => {
      const dto = { promedioPonderado: 20 };
      const result = await service.update(1, dto);
      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result.promedioPonderado).toBe(20);
    });
  });

  describe('remove', () => {
    it('should remove a response', async () => {
      const result = await service.remove(1);
      expect(repository.remove).toHaveBeenCalled();
      expect(result).toEqual(mockEncuestaRespuesta);
    });
  });
});

