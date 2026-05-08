import { Test, TestingModule } from '@nestjs/testing';
import { ConstanciasController } from './constancias.controller';
import { ConstanciasService } from './constancias.service';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';

describe('ConstanciasController', () => {
  let controller: ConstanciasController;
  let service: ConstanciasService;

  const mockConstancia = {
    id: '1',
    tipo: 'MATRICULA',
    estudiante: 'Juan Perez',
  };

  const mockConstanciasService = {
    create: jest.fn().mockResolvedValue(mockConstancia),
    findAll: jest.fn().mockResolvedValue([mockConstancia]),
    findPendientes: jest.fn().mockResolvedValue([mockConstancia]),
    findByImpreso: jest.fn().mockResolvedValue([mockConstancia]),
    findByAceptado: jest.fn().mockResolvedValue([mockConstancia]),
    findOne: jest.fn().mockResolvedValue(mockConstancia),
    update: jest.fn().mockResolvedValue(mockConstancia),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConstanciasController],
      providers: [
        {
          provide: ConstanciasService,
          useValue: mockConstanciasService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ConstanciasController>(ConstanciasController);
    service = module.get<ConstanciasService>(ConstanciasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of constancias', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockConstancia]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findPendientes', () => {
    it('should return pending constancias', async () => {
      const result = await controller.findPendientes();
      expect(result).toEqual([mockConstancia]);
      expect(service.findPendientes).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a constancia', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockConstancia);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('create', () => {
    it('should create a constancia', async () => {
      const dto = { tipo: 'MATRICULA' } as any;
      const result = await controller.create(dto);
      expect(result).toEqual(mockConstancia);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });
});
