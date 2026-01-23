import { Test, TestingModule } from '@nestjs/testing';
import { PuntajeAcademicoAdministrativoService } from './puntaje_academico_administrativo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PuntajeAcademicoAdministrativo } from './entities/puntaje_academico_administrativo.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('PuntajeAcademicoAdministrativoService', () => {
  let service: PuntajeAcademicoAdministrativoService;
  let repository: Repository<PuntajeAcademicoAdministrativo>;

  const mockPuntaje = {
    id: 1,
    academicoAdministrativoId: 1,
    nombre: 'Test Puntaje',
    puntaje: 10,
    academicoAdministrativo: { id: 1, nombre: 'Categoria Test' },
  };

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockResolvedValue(mockPuntaje),
    find: jest.fn().mockResolvedValue([mockPuntaje]),
    findOne: jest.fn().mockResolvedValue(mockPuntaje),
    remove: jest.fn().mockResolvedValue(mockPuntaje),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PuntajeAcademicoAdministrativoService,
        {
          provide: getRepositoryToken(PuntajeAcademicoAdministrativo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PuntajeAcademicoAdministrativoService>(PuntajeAcademicoAdministrativoService);
    repository = module.get<Repository<PuntajeAcademicoAdministrativo>>(getRepositoryToken(PuntajeAcademicoAdministrativo));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new puntaje', async () => {
      const dto = { academico_administrativo_id: 1, nombre: 'Test Puntaje', puntaje: 10 };
      expect(await service.create(dto)).toEqual(mockPuntaje);
      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        academicoAdministrativoId: 1,
      });
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of puntajes', async () => {
      expect(await service.findAll()).toEqual([mockPuntaje]);
      expect(repository.find).toHaveBeenCalledWith({ relations: ['academicoAdministrativo'] });
    });
  });

  describe('findOne', () => {
    it('should return a puntaje by id', async () => {
      expect(await service.findOne(1)).toEqual(mockPuntaje);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['academicoAdministrativo'],
      });
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a puntaje', async () => {
      const updateDto = { nombre: 'Updated Name' };
      const updatedPuntaje = { ...mockPuntaje, ...updateDto };
      jest.spyOn(repository, 'save').mockResolvedValueOnce(updatedPuntaje as any);

      expect(await service.update(1, updateDto)).toEqual(updatedPuntaje);
      expect(repository.findOne).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a puntaje', async () => {
      expect(await service.remove(1)).toEqual(mockPuntaje);
      expect(repository.remove).toHaveBeenCalled();
    });
  });
});
