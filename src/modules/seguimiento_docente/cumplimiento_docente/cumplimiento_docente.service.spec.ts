import { Test, TestingModule } from '@nestjs/testing';
import { CumplimientoDocenteService } from './cumplimiento_docente.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CumplimientoDocente } from './entities/cumplimiento_docente.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('CumplimientoDocenteService', () => {
  let service: CumplimientoDocenteService;
  let repository: Repository<CumplimientoDocente>;

  const mockCumplimiento = {
    id: 1,
    moduloId: 101,
    docenteId: 'docente-uuid',
    academicoAdministrativoId: 201,
    puntaje: 50,
    modulo: { id: 101 },
    docente: { id: 'docente-uuid' },
    academicoAdministrativo: { id: 201 },
  };

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockResolvedValue(mockCumplimiento),
    find: jest.fn().mockResolvedValue([mockCumplimiento]),
    findOne: jest.fn().mockResolvedValue(mockCumplimiento),
    remove: jest.fn().mockResolvedValue(mockCumplimiento),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CumplimientoDocenteService,
        {
          provide: getRepositoryToken(CumplimientoDocente),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CumplimientoDocenteService>(CumplimientoDocenteService);
    repository = module.get<Repository<CumplimientoDocente>>(getRepositoryToken(CumplimientoDocente));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cumplimiento', async () => {
      const dto = { moduloId: 101, docenteId: 'docente-uuid', academicoAdministrativoId: 201, puntaje: 50 };
      expect(await service.create(dto)).toEqual(mockCumplimiento);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of cumplimientos', async () => {
      expect(await service.findAll()).toEqual([mockCumplimiento]);
      expect(repository.find).toHaveBeenCalledWith({ relations: ['modulo', 'docente', 'academicoAdministrativo'] });
    });
  });

  describe('findOne', () => {
    it('should return a cumplimiento by id', async () => {
      expect(await service.findOne(1)).toEqual(mockCumplimiento);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['modulo', 'docente', 'academicoAdministrativo'],
      });
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a cumplimiento', async () => {
      const updateDto = { puntaje: 75 };
      const updatedCumplimiento = { ...mockCumplimiento, ...updateDto };
      jest.spyOn(repository, 'save').mockResolvedValueOnce(updatedCumplimiento as any);

      expect(await service.update(1, updateDto)).toEqual(updatedCumplimiento);
      expect(repository.findOne).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a cumplimiento', async () => {
      expect(await service.remove(1)).toEqual(mockCumplimiento);
      expect(repository.remove).toHaveBeenCalled();
    });
  });
});
