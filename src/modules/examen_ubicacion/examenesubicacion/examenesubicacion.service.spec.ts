import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Detallesubicacion } from '../detallesubicacion/entities/detallesubicacion.entity';
import { Examenesubicacion } from './entities/examenesubicacion.entity';
import { ExamenesubicacionService } from './examenesubicacion.service';

describe('ExamenesubicacionService', () => {
  let service: ExamenesubicacionService;
  let examenesubicacionRepository: {
    findOne: jest.Mock;
    delete: jest.Mock;
  };
  let detallesubicacionRepository: {
    count: jest.Mock;
  };

  const examen = {
    id: 23,
    codigo: 'UBI-2026-001',
  } as Examenesubicacion;

  beforeEach(async () => {
    examenesubicacionRepository = {
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    detallesubicacionRepository = {
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamenesubicacionService,
        {
          provide: getRepositoryToken(Examenesubicacion),
          useValue: examenesubicacionRepository,
        },
        {
          provide: getRepositoryToken(Detallesubicacion),
          useValue: detallesubicacionRepository,
        },
      ],
    }).compile();

    service = module.get<ExamenesubicacionService>(ExamenesubicacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('remove', () => {
    it('should return null when the exam does not exist', async () => {
      examenesubicacionRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(23)).resolves.toBeNull();
      expect(detallesubicacionRepository.count).not.toHaveBeenCalled();
      expect(examenesubicacionRepository.delete).not.toHaveBeenCalled();
    });

    it('should reject deletion when the exam has linked details', async () => {
      examenesubicacionRepository.findOne.mockResolvedValue(examen);
      detallesubicacionRepository.count.mockResolvedValue(5);

      let error: unknown;
      try {
        await service.remove(23);
      } catch (caught) {
        error = caught;
      }

      expect(error).toBeInstanceOf(ConflictException);
      expect((error as ConflictException).getResponse()).toEqual({
        statusCode: 409,
        code: 'EXAMEN_CON_DETALLES',
        message:
          'No se puede eliminar el examen porque tiene participantes asociados',
        detallesCount: 5,
      });
      expect(detallesubicacionRepository.count).toHaveBeenCalledWith({
        where: { examenId: 23 },
      });
      expect(examenesubicacionRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete and return the exam when it has no linked details', async () => {
      examenesubicacionRepository.findOne.mockResolvedValue(examen);
      detallesubicacionRepository.count.mockResolvedValue(0);
      examenesubicacionRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove(23)).resolves.toBe(examen);
      expect(examenesubicacionRepository.delete).toHaveBeenCalledWith(23);
    });
  });
});
