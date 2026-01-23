import { Test, TestingModule } from '@nestjs/testing';
import { TipoDocumentoPerfilService } from './tipo_documento_perfil.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TipoDocumentoPerfil } from './entities/tipo_documento_perfil.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('TipoDocumentoPerfilService', () => {
  let service: TipoDocumentoPerfilService;
  let repository: Repository<TipoDocumentoPerfil>;

  const mockTipoDocumentoPerfilRepository = {
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
        TipoDocumentoPerfilService,
        {
          provide: getRepositoryToken(TipoDocumentoPerfil),
          useValue: mockTipoDocumentoPerfilRepository,
        },
      ],
    }).compile();

    service = module.get<TipoDocumentoPerfilService>(TipoDocumentoPerfilService);
    repository = module.get<Repository<TipoDocumentoPerfil>>(getRepositoryToken(TipoDocumentoPerfil));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new tipo documento perfil', async () => {
      const createDto = { nombre: 'Test Document', puntaje: 10 };
      const expectedResult = { id: 1, ...createDto };

      mockTipoDocumentoPerfilRepository.create.mockReturnValue(expectedResult);
      mockTipoDocumentoPerfilRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);
      expect(mockTipoDocumentoPerfilRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockTipoDocumentoPerfilRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of tipo documento perfil', async () => {
      const expectedResult = [{ id: 1, nombre: 'Test Document', puntaje: 10 }];
      mockTipoDocumentoPerfilRepository.find.mockResolvedValue(expectedResult);

      const result = await service.findAll();
      expect(mockTipoDocumentoPerfilRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single tipo documento perfil', async () => {
      const expectedResult = { id: 1, nombre: 'Test Document', puntaje: 10 };
      mockTipoDocumentoPerfilRepository.findOne.mockResolvedValue(expectedResult);

      const result = await service.findOne(1);
      expect(mockTipoDocumentoPerfilRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(expectedResult);
    });

    it('should throw a NotFoundException if not found', async () => {
      mockTipoDocumentoPerfilRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a tipo documento perfil', async () => {
      const updateDto = { puntaje: 20 };
      const expectedResult = { id: 1, nombre: 'Test Document', puntaje: 20 };

      mockTipoDocumentoPerfilRepository.preload.mockResolvedValue(expectedResult);
      mockTipoDocumentoPerfilRepository.save.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateDto);
      expect(mockTipoDocumentoPerfilRepository.preload).toHaveBeenCalledWith({ id: 1, ...updateDto });
      expect(mockTipoDocumentoPerfilRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw a NotFoundException if not found', async () => {
      mockTipoDocumentoPerfilRepository.preload.mockResolvedValue(null);
      await expect(service.update(1, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a tipo documento perfil', async () => {
      const toRemove = { id: 1 };
      mockTipoDocumentoPerfilRepository.findOne.mockResolvedValue(toRemove);
      mockTipoDocumentoPerfilRepository.remove.mockResolvedValue(toRemove);

      await service.remove(1);
      expect(mockTipoDocumentoPerfilRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockTipoDocumentoPerfilRepository.remove).toHaveBeenCalledWith(toRemove);
    });

    it('should throw a NotFoundException if not found', async () => {
      mockTipoDocumentoPerfilRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
