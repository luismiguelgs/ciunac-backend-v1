import { Test, TestingModule } from '@nestjs/testing';
import { EncuestaRespuestasDetalleService } from './encuesta_respuestas_detalle.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EncuestaRespuestasDetalle } from './entities/encuesta_respuestas_detalle.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('EncuestaRespuestasDetalleService', () => {
  let service: EncuestaRespuestasDetalleService;
  let repository: Repository<EncuestaRespuestasDetalle>;

  const mockDetail = {
    id: 1,
    encuestaId: 1,
    preguntaId: 5,
    valorTexto: 'Excelente',
    valorNumero: 5,
    encuesta: { id: 1 },
    pregunta: { id: 5, textoPregunta: '...' },
  };

  const mockRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(detail => Promise.resolve({ ...mockDetail, ...detail })),
    find: jest.fn().mockResolvedValue([mockDetail]),
    findOne: jest.fn().mockImplementation(({ where: { id } }) => {
      if (id === 1) return Promise.resolve(mockDetail);
      return Promise.resolve(null);
    }),
    merge: jest.fn().mockImplementation((entity, dto) => Object.assign(entity, dto)),
    remove: jest.fn().mockResolvedValue(mockDetail),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncuestaRespuestasDetalleService,
        {
          provide: getRepositoryToken(EncuestaRespuestasDetalle),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EncuestaRespuestasDetalleService>(EncuestaRespuestasDetalleService);
    repository = module.get<Repository<EncuestaRespuestasDetalle>>(getRepositoryToken(EncuestaRespuestasDetalle));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new detail', async () => {
      const dto = { encuestaId: 1, preguntaId: 5, valorTexto: 'Bueno', valorNumero: 4 };
      const result = await service.create(dto);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(dto));
    });
  });

  describe('findAll', () => {
    it('should return all details', async () => {
      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockDetail]);
    });
  });

  describe('findOne', () => {
    it('should return a detail by id', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockDetail);
    });

    it('should throw NotFoundException', async () => {
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a detail', async () => {
      const dto = { valorTexto: 'Regular' };
      const result = await service.update(1, dto);
      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result.valorTexto).toBe('Regular');
    });
  });

  describe('remove', () => {
    it('should remove a detail', async () => {
      const result = await service.remove(1);
      expect(repository.remove).toHaveBeenCalled();
      expect(result).toEqual(mockDetail);
    });
  });
});

