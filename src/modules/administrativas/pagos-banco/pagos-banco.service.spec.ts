import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PagosBancoService } from './pagos-banco.service';
import { PagosBanco } from './entities/pagos-banco.entity';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';
import { NotFoundException } from '@nestjs/common';

describe('PagosBancoService', () => {
  let service: PagosBancoService;
  let repository: Repository<PagosBanco>;

  const mockPagosBancoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockSolicitudRepository = {
    find: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPago = {
    id: 1,
    dniCodigo: '12345678',
    numeroVoucher: 'V001',
    alumno: 'Juan Perez',
    monto: 100.50,
    fechaPago: new Date(),
    fechaEfectiva: new Date(),
    archivo: 'voucher.pdf',
    creadoEn: new Date(),
    modificadoEn: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosBancoService,
        {
          provide: getRepositoryToken(PagosBanco),
          useValue: mockPagosBancoRepository,
        },
        {
          provide: getRepositoryToken(Solicitud),
          useValue: mockSolicitudRepository,
        },
      ],
    }).compile();

    service = module.get<PagosBancoService>(PagosBancoService);
    repository = module.get<Repository<PagosBanco>>(getRepositoryToken(PagosBanco));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new pago', async () => {
      const createDto = { dniCodigo: '12345678', numeroVoucher: 'V001' };
      mockPagosBancoRepository.create.mockReturnValue(mockPago);
      mockPagosBancoRepository.save.mockResolvedValue(mockPago);

      const result = await service.create(createDto as any);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockPago);
      expect(result).toEqual(mockPago);
    });
  });

  describe('findAll', () => {
    it('should return an array of pagos', async () => {
      mockPagosBancoRepository.find.mockResolvedValue([mockPago]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({ order: { creadoEn: 'DESC' } });
      expect(result).toEqual([mockPago]);
    });
  });

  describe('findOne', () => {
    it('should return a single pago if found', async () => {
      mockPagosBancoRepository.findOne.mockResolvedValue(mockPago);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockPago);
    });

    it('should throw NotFoundException if pago not found', async () => {
      mockPagosBancoRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and save the pago', async () => {
      const updateDto = { alumno: 'Juan Updated' };
      mockPagosBancoRepository.findOne.mockResolvedValue(mockPago);
      mockPagosBancoRepository.save.mockResolvedValue({ ...mockPago, ...updateDto });

      const result = await service.update(1, updateDto as any);

      expect(repository.save).toHaveBeenCalled();
      expect(result.alumno).toEqual('Juan Updated');
    });
  });

  describe('remove', () => {
    it('should remove the pago if found', async () => {
      mockPagosBancoRepository.findOne.mockResolvedValue(mockPago);
      mockPagosBancoRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(mockPago);
    });
  });
});
