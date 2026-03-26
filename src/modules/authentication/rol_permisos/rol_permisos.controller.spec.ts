import { Test, TestingModule } from '@nestjs/testing';
import { RolPermisosController } from './rol_permisos.controller';
import { RolPermisosService } from './rol_permisos.service';
import { RolUsuario } from '../usuarios/entities/usuario.entity';

describe('RolPermisosController', () => {
  let controller: RolPermisosController;
  let service: RolPermisosService;

  const mockRolPermiso = {
    id: 1,
    rol: RolUsuario.ADMINISTRATIVO,
    permisoId: 10,
    descripcion: 'Test',
    permiso: { id: 10, codigo: 'TEST_CODE', modulo: 'TEST_MODULE' }
  };

  const mockRolPermisosService = {
    create: jest.fn().mockResolvedValue(mockRolPermiso),
    findAll: jest.fn().mockResolvedValue([mockRolPermiso]),
    findOne: jest.fn().mockResolvedValue(mockRolPermiso),
    update: jest.fn().mockResolvedValue({ ...mockRolPermiso, descripcion: 'Updated' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolPermisosController],
      providers: [
        {
          provide: RolPermisosService,
          useValue: mockRolPermisosService,
        },
      ],
    }).compile();

    controller = module.get<RolPermisosController>(RolPermisosController);
    service = module.get<RolPermisosService>(RolPermisosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a rol_permiso', async () => {
      const dto = { rol: RolUsuario.ADMINISTRATIVO, permisoId: 10, descripcion: 'Test' };
      const result = await controller.create(dto);
      expect(result).toEqual(mockRolPermiso);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of rol_permisos', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockRolPermiso]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single rol_permiso', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockRolPermiso);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a rol_permiso', async () => {
      const dto = { descripcion: 'Updated' };
      const result = await controller.update('1', dto);
      expect(result.descripcion).toEqual('Updated');
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a rol_permiso', async () => {
      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
