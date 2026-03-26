import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RolPermisosService } from './rol_permisos.service';
import { RolPermiso } from './entities/rol_permiso.entity';
import { RolUsuario } from '../usuarios/entities/usuario.entity';

describe('RolPermisosService', () => {
  let service: RolPermisosService;
  let repository: Repository<RolPermiso>;

  const mockRolPermiso = {
    id: 1,
    rol: RolUsuario.ADMINISTRATIVO,
    permisoId: 10,
    descripcion: 'Test permission',
    permiso: { id: 10, codigo: 'TEST_CODE', modulo: 'TEST_MODULE' }
  };

  const mockRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(rolPermiso => Promise.resolve({ id: 1, ...rolPermiso })),
    find: jest.fn().mockResolvedValue([mockRolPermiso]),
    findOne: jest.fn().mockImplementation(({ where: { id } }) => {
      if (id === 1) return Promise.resolve(mockRolPermiso);
      return Promise.resolve(null);
    }),
    merge: jest.fn().mockImplementation((target, source) => Object.assign(target, source)),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolPermisosService,
        {
          provide: getRepositoryToken(RolPermiso),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RolPermisosService>(RolPermisosService);
    repository = module.get<Repository<RolPermiso>>(getRepositoryToken(RolPermiso));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new rol_permiso', async () => {
      const dto = { rol: RolUsuario.ADMINISTRATIVO, permisoId: 10, descripcion: 'New' };
      const result = await service.create(dto);
      expect(result).toEqual({ id: 1, ...dto });
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of rol_permisos', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockRolPermiso]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single rol_permiso', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockRolPermiso);
    });

    it('should throw NotFoundException if not found', async () => {
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a rol_permiso', async () => {
      const dto = { descripcion: 'Updated' };
      const result = await service.update(1, dto);
      expect(result.descripcion).toEqual('Updated');
      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a rol_permiso', async () => {
      await service.remove(1);
      expect(repository.remove).toHaveBeenCalled();
    });
  });
});
