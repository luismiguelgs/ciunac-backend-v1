import { Test, TestingModule } from '@nestjs/testing';
import { PagosBancoController } from './pagos-banco.controller';
import { PagosBancoService } from './pagos-banco.service';
import { JwtAuthGuard } from 'src/modules/authentication/auth/guards/jwt-auth.guard';

describe('PagosBancoController', () => {
  let controller: PagosBancoController;
  let service: PagosBancoService;

  const mockPagosBancoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPago = {
    id: 1,
    dniCodigo: '12345678',
    numeroVoucher: 'V001',
    alumno: 'Juan Perez',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagosBancoController],
      providers: [
        {
          provide: PagosBancoService,
          useValue: mockPagosBancoService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PagosBancoController>(PagosBancoController);
    service = module.get<PagosBancoService>(PagosBancoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const createDto = { dniCodigo: '12345678', numeroVoucher: 'V001' };
      mockPagosBancoService.create.mockResolvedValue(mockPago);

      const result = await controller.create(createDto as any);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockPago);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      mockPagosBancoService.findAll.mockResolvedValue([mockPago]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockPago]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      mockPagosBancoService.findOne.mockResolvedValue(mockPago);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPago);
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const updateDto = { alumno: 'Juan Updated' };
      mockPagosBancoService.update.mockResolvedValue({ ...mockPago, ...updateDto });

      const result = await controller.update('1', updateDto as any);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.alumno).toEqual('Juan Updated');
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      mockPagosBancoService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
