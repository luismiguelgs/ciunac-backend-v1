import { Test, TestingModule } from '@nestjs/testing';
import { CumplimientoDocenteController } from './cumplimiento_docente.controller';
import { CumplimientoDocenteService } from './cumplimiento_docente.service';

describe('CumplimientoDocenteController', () => {
  let controller: CumplimientoDocenteController;
  let service: CumplimientoDocenteService;

  const mockCumplimiento = {
    id: 1,
    moduloId: 101,
    docenteId: 'docente-uuid',
    academicoAdministrativoId: 201,
    puntaje: 50,
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockCumplimiento),
    findAll: jest.fn().mockResolvedValue([mockCumplimiento]),
    findOne: jest.fn().mockResolvedValue(mockCumplimiento),
    update: jest.fn().mockResolvedValue(mockCumplimiento),
    remove: jest.fn().mockResolvedValue(mockCumplimiento),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CumplimientoDocenteController],
      providers: [
        {
          provide: CumplimientoDocenteService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CumplimientoDocenteController>(CumplimientoDocenteController);
    service = module.get<CumplimientoDocenteService>(CumplimientoDocenteService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a cumplimiento', async () => {
      const dto = { moduloId: 101, docenteId: 'docente-uuid', academicoAdministrativoId: 201, puntaje: 50 };
      expect(await controller.create(dto)).toEqual(mockCumplimiento);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of cumplimientos', async () => {
      expect(await controller.findAll()).toEqual([mockCumplimiento]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a cumplimiento by id', async () => {
      expect(await controller.findOne(1)).toEqual(mockCumplimiento);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a cumplimiento', async () => {
      const dto = { puntaje: 75 };
      expect(await controller.update(1, dto)).toEqual(mockCumplimiento);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a cumplimiento', async () => {
      expect(await controller.remove(1)).toEqual(mockCumplimiento);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
