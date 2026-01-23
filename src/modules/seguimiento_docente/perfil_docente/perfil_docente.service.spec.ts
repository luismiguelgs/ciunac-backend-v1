import { Test, TestingModule } from '@nestjs/testing';
import { PerfilDocenteService } from './perfil_docente.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PerfilDocente, NivelIdioma } from './entities/perfil_docente.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('PerfilDocenteService', () => {
  let service: PerfilDocenteService;
  let repository: Repository<PerfilDocente>;

  const mockPerfilDocenteRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilDocenteService,
        {
          provide: getRepositoryToken(PerfilDocente),
          useValue: mockPerfilDocenteRepository,
        },
      ],
    }).compile();

    service = module.get<PerfilDocenteService>(PerfilDocenteService);
    repository = module.get<Repository<PerfilDocente>>(getRepositoryToken(PerfilDocente));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new perfil docente', async () => {
      const createPerfilDocenteDto = {
        docenteId: 'a4b8-a8f0-4b3c-9d1e-8e7f6a5b4c3d',
        experienciaTotal: 5,
        idiomaId: 1,
        nivelIdioma: NivelIdioma.B2,
        puntajeFinal: 90,
      };
      const expectedResult = { id: 1, ...createPerfilDocenteDto };

      mockPerfilDocenteRepository.create.mockReturnValue(expectedResult);
      mockPerfilDocenteRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(createPerfilDocenteDto);
      expect(mockPerfilDocenteRepository.create).toHaveBeenCalledWith(createPerfilDocenteDto);
      expect(mockPerfilDocenteRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of perfiles docentes', async () => {
      const expectedResult = [{ id: 1, docenteId: 'a4b8-a8f0-4b3c-9d1e-8e7f6a5b4c3d', experienciaTotal: 5, idiomaId: 1, nivelIdioma: NivelIdioma.B2, puntajeFinal: 90 }];
      mockPerfilDocenteRepository.find.mockResolvedValue(expectedResult);

      const result = await service.findAll();
      expect(mockPerfilDocenteRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single perfil docente', async () => {
      const expectedResult = { id: 1, docenteId: 'a4b8-a8f0-4b3c-9d1e-8e7f6a5b4c3d', experienciaTotal: 5, idiomaId: 1, nivelIdioma: NivelIdioma.B2, puntajeFinal: 90 };
      mockPerfilDocenteRepository.findOne.mockResolvedValue(expectedResult);

      const result = await service.findOne(1);
      expect(mockPerfilDocenteRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(expectedResult);
    });

    it('should throw a NotFoundException if perfil docente not found', async () => {
      mockPerfilDocenteRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a perfil docente', async () => {
      const updatePerfilDocenteDto = { puntajeFinal: 95 };
      const expectedResult = { id: 1, docenteId: 'a4b8-a8f0-4b3c-9d1e-8e7f6a5b4c3d', experienciaTotal: 5, idiomaId: 1, nivelIdioma: NivelIdioma.B2, puntajeFinal: 95 };

      mockPerfilDocenteRepository.preload.mockResolvedValue(expectedResult);
      mockPerfilDocenteRepository.save.mockResolvedValue(expectedResult);

      const result = await service.update(1, updatePerfilDocenteDto);
      expect(mockPerfilDocenteRepository.preload).toHaveBeenCalledWith({ id: 1, ...updatePerfilDocenteDto });
      expect(mockPerfilDocenteRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw a NotFoundException if perfil docente to update not found', async () => {
      mockPerfilDocenteRepository.preload.mockResolvedValue(null);
      await expect(service.update(1, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a perfil docente', async () => {
      const perfilToRemove = { id: 1 };
      mockPerfilDocenteRepository.findOne.mockResolvedValue(perfilToRemove);
      mockPerfilDocenteRepository.remove.mockResolvedValue(perfilToRemove);

      await service.remove(1);
      expect(mockPerfilDocenteRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockPerfilDocenteRepository.remove).toHaveBeenCalledWith(perfilToRemove);
    });

    it('should throw a NotFoundException if perfil docente to remove not found', async () => {
      mockPerfilDocenteRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
