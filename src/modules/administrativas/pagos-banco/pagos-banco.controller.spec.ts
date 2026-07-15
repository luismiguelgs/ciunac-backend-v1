/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';
import { PagosBancoController } from './pagos-banco.controller';
import { PagosBancoService } from './pagos-banco.service';

describe('PagosBancoController', () => {
  let controller: PagosBancoController;
  let service: PagosBancoService;

  const mockPagosBancoService = {
    uploadAndProcess: jest.fn(),
    reverifyUnverified: jest.fn(),
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
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagosBancoController],
      providers: [
        {
          provide: PagosBancoService,
          useValue: mockPagosBancoService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PagosBancoController>(PagosBancoController);
    service = module.get<PagosBancoService>(PagosBancoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('rejects a missing file', async () => {
      await expect(controller.uploadFile(undefined as never)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects a non-CSV file', async () => {
      const file = {
        mimetype: 'application/pdf',
        originalname: 'pagos.pdf',
        buffer: Buffer.from('data'),
      } as Express.Multer.File;

      await expect(controller.uploadFile(file)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('accepts an uppercase CSV extension and delegates processing', async () => {
      const file = {
        mimetype: 'application/octet-stream',
        originalname: 'pagos.CSV',
        buffer: Buffer.from('csv'),
      } as Express.Multer.File;
      const expected = {
        message: 'Carga completada',
        resumen: { pagosRegistrados: 1 },
      };
      mockPagosBancoService.uploadAndProcess.mockResolvedValue(expected);

      await expect(controller.uploadFile(file)).resolves.toEqual(expected);
      expect(service.uploadAndProcess).toHaveBeenCalledWith(file.buffer);
    });
  });

  it('returns the structured reverification result', async () => {
    const expected = {
      message: 'Reverificación completada',
      resumen: { pagosEvaluados: 2, pagosVerificados: 1 },
    };
    mockPagosBancoService.reverifyUnverified.mockResolvedValue(expected);

    await expect(controller.reverify()).resolves.toEqual(expected);
  });

  it('calls service.create', async () => {
    const createDto = { dniCodigo: '12345678', numeroVoucher: 'V001' };
    mockPagosBancoService.create.mockResolvedValue(mockPago);

    const result = await controller.create(createDto);

    expect(service.create).toHaveBeenCalledWith(createDto);
    expect(result).toEqual(mockPago);
  });

  it('calls service.findAll', async () => {
    mockPagosBancoService.findAll.mockResolvedValue([mockPago]);

    await expect(controller.findAll()).resolves.toEqual([mockPago]);
  });

  it('calls service.findOne', async () => {
    mockPagosBancoService.findOne.mockResolvedValue(mockPago);

    await expect(controller.findOne(1)).resolves.toEqual(mockPago);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('calls service.update', async () => {
    const updateDto = { alumno: 'Juan Updated' };
    mockPagosBancoService.update.mockResolvedValue({
      ...mockPago,
      ...updateDto,
    });

    const result = await controller.update(1, updateDto);

    expect(service.update).toHaveBeenCalledWith(1, updateDto);
    expect(result.alumno).toBe('Juan Updated');
  });

  it('calls service.remove', async () => {
    mockPagosBancoService.remove.mockResolvedValue(undefined);

    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
