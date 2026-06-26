import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { UploadService } from 'src/shared/upload/upload.service';
import { SolicitudesService } from '../solicitudes/solicitudes.service';
import { ConstanciasService } from './constancias.service';
import { Constancia } from './schemas/constancia.schema';

describe('ConstanciasService', () => {
  let service: ConstanciasService;
  let model: any;
  let uploadService: {
    findSignedVersion: jest.Mock;
    moveFileToRepository: jest.Mock;
    trashFile: jest.Mock;
  };
  let solicitudesService: {
    findOne: jest.Mock;
    update: jest.Mock;
  };

  const mockConstancia = {
    _id: new Types.ObjectId(),
    tipo: 'MATRICULA',
    estudiante: 'Juan Perez',
    dni: '12345678',
    idioma: 'INGLES',
    nivel: 'BASICO',
    ciclo: 1,
    impreso: false,
    aceptado: false,
    id_solicitud: 123,
    modalidad: 'REGULAR',
    driveId: 'stored-original-id',
    url: 'original-url',
  };

  const mockConstanciaModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  };

  function MockModel(dto: any) {
    Object.assign(this, dto);
    this.save = jest.fn().mockResolvedValue({
      toObject: jest
        .fn()
        .mockReturnValue({ ...dto, _id: new Types.ObjectId() }),
    });
  }
  Object.assign(MockModel, mockConstanciaModel);

  beforeEach(async () => {
    jest.clearAllMocks();
    uploadService = {
      findSignedVersion: jest.fn(),
      moveFileToRepository: jest.fn(),
      trashFile: jest.fn(),
    };
    solicitudesService = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConstanciasService,
        { provide: getModelToken(Constancia.name), useValue: MockModel },
        { provide: UploadService, useValue: uploadService },
        { provide: SolicitudesService, useValue: solicitudesService },
      ],
    }).compile();

    service = module.get<ConstanciasService>(ConstanciasService);
    model = module.get(getModelToken(Constancia.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all constancias', async () => {
      mockConstanciaModel.find.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockConstancia]),
      });

      const constancias = await service.findAll();

      expect(constancias).toHaveLength(1);
      expect(constancias[0]._id).toBeDefined();
    });
  });

  describe('findPendientes', () => {
    it('returns pending constancias', async () => {
      mockConstanciaModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockConstancia]),
      });

      const constancias = await service.findPendientes();

      expect(model.find).toHaveBeenCalledWith({
        impreso: false,
        aceptado: false,
      });
      expect(constancias).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns a constancia by id', async () => {
      mockFindOne(mockConstancia);

      const constancia = await service.findOne(
        mockConstancia._id.toHexString(),
      );

      expect(constancia).toBeDefined();
      expect(constancia?._id).toBeDefined();
    });

    it('returns null if not found', async () => {
      mockFindOne(null);

      await expect(service.findOne('nonexistent')).resolves.toBeNull();
    });
  });

  describe('procesarFirma', () => {
    beforeEach(() => {
      mockFindOne(mockConstancia);
      solicitudesService.findOne.mockResolvedValue({ id: 123 });
      solicitudesService.update.mockResolvedValue({ id: 123, estadoId: 3 });
      uploadService.findSignedVersion.mockResolvedValue({
        originalFile: {
          id: 'stored-original-id',
          name: 'constancia-123.pdf',
        },
        signedFile: {
          id: 'signed-id',
          name: '[FIRMADO] constancia-123.pdf',
        },
      });
      uploadService.moveFileToRepository.mockResolvedValue({
        id: 'signed-id',
        name: '[FIRMADO] constancia-123.pdf',
        viewLink: 'signed-view',
        downloadLink: 'signed-download',
      });
      uploadService.trashFile.mockResolvedValue(undefined);
      mockConstanciaModel.findOneAndUpdate.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...mockConstancia, driveId: 'signed-id' }),
      });
    });

    it('moves the signed file, updates both stores, and trashes the original', async () => {
      const result = await service.procesarFirma(
        'constancia-1',
        'stale-frontend-id',
        123,
      );

      expect(uploadService.findSignedVersion).toHaveBeenCalledWith(
        'stored-original-id',
        undefined,
      );
      expect(uploadService.moveFileToRepository).toHaveBeenCalledWith(
        'signed-id',
      );
      expect(mockConstanciaModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          impreso: true,
          driveId: 'signed-id',
          url: 'signed-view',
          driveIdOriginal: 'stored-original-id',
          originalTrashed: false,
        }),
        { new: true },
      );
      expect(solicitudesService.update).toHaveBeenCalledWith(123, {
        estadoId: 3,
      });
      expect(uploadService.trashFile).toHaveBeenCalledWith(
        'stored-original-id',
      );
      expect(result).toEqual({
        success: true,
        fileId: 'signed-id',
        name: '[FIRMADO] constancia-123.pdf',
        viewLink: 'signed-view',
        originalTrashed: true,
      });
    });

    it('fails before consulting Drive when the constancia does not exist', async () => {
      mockFindOne(null);

      await expect(
        service.procesarFirma('missing', 'fallback-id', 123),
      ).rejects.toThrow(NotFoundException);

      expect(solicitudesService.findOne).not.toHaveBeenCalled();
      expect(uploadService.findSignedVersion).not.toHaveBeenCalled();
    });

    it('fails when neither Mongo nor the request provides a driveId', async () => {
      mockFindOne({ ...mockConstancia, driveId: undefined });

      await expect(
        service.procesarFirma('constancia-1', undefined, 123),
      ).rejects.toThrow(BadRequestException);

      expect(uploadService.findSignedVersion).not.toHaveBeenCalled();
    });

    it('uses the request fileId only when Mongo has no driveId', async () => {
      mockFindOne({ ...mockConstancia, driveId: undefined });

      await service.procesarFirma('constancia-1', 'fallback-id', 123);

      expect(uploadService.findSignedVersion).toHaveBeenCalledWith(
        'fallback-id',
        undefined,
      );
    });

    it('uses the stored solicitud id when the request omits it', async () => {
      await service.procesarFirma('constancia-1', undefined);

      expect(solicitudesService.findOne).toHaveBeenCalledWith(123);
      expect(solicitudesService.update).toHaveBeenCalledWith(123, {
        estadoId: 3,
      });
    });

    it('rejects a solicitud id that does not belong to the constancia', async () => {
      await expect(
        service.procesarFirma('constancia-1', undefined, 999),
      ).rejects.toThrow(BadRequestException);

      expect(solicitudesService.findOne).not.toHaveBeenCalled();
      expect(uploadService.findSignedVersion).not.toHaveBeenCalled();
    });

    it('forwards an explicit signed file id to Drive', async () => {
      await service.procesarFirma(
        'constancia-1',
        undefined,
        123,
        'signed-from-frontend',
      );

      expect(uploadService.findSignedVersion).toHaveBeenCalledWith(
        'stored-original-id',
        'signed-from-frontend',
      );
    });

    it('does not update states when the signed file is not found', async () => {
      uploadService.findSignedVersion.mockRejectedValue(
        new NotFoundException('Firmado no encontrado'),
      );

      await expect(
        service.procesarFirma('constancia-1', 'stale-id', 123),
      ).rejects.toThrow(NotFoundException);

      expect(uploadService.moveFileToRepository).not.toHaveBeenCalled();
      expect(mockConstanciaModel.findOneAndUpdate).not.toHaveBeenCalled();
      expect(solicitudesService.update).not.toHaveBeenCalled();
    });

    it('returns a warning when the original cannot be trashed', async () => {
      uploadService.trashFile.mockRejectedValue(new Error('Drive unavailable'));

      const result = await service.procesarFirma(
        'constancia-1',
        undefined,
        123,
      );

      expect(result.success).toBe(true);
      expect(result.originalTrashed).toBe(false);
      expect(result.warning).toContain('no se pudo enviar el archivo original');
      expect(mockConstanciaModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          driveIdOriginal: 'stored-original-id',
          originalTrashed: false,
        }),
        { new: true },
      );
    });

    it('retries cleanup using the stored original id', async () => {
      mockFindOne({
        ...mockConstancia,
        impreso: true,
        driveId: 'signed-id',
        driveIdOriginal: 'stored-original-id',
        originalTrashed: false,
      });

      await service.procesarFirma('constancia-1', undefined);

      expect(uploadService.findSignedVersion).toHaveBeenCalledWith(
        'stored-original-id',
        'signed-id',
      );
      expect(uploadService.trashFile).toHaveBeenCalledWith(
        'stored-original-id',
      );
    });

    it('reports successful trash when only recording cleanup fails', async () => {
      mockConstanciaModel.findOneAndUpdate
        .mockReturnValueOnce({
          exec: jest
            .fn()
            .mockResolvedValue({ ...mockConstancia, driveId: 'signed-id' }),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockRejectedValue(new Error('Mongo unavailable')),
        });

      const result = await service.procesarFirma(
        'constancia-1',
        undefined,
        123,
      );

      expect(result.originalTrashed).toBe(true);
      expect(result.warning).toContain('no se pudo registrar la limpieza');
    });

    it('restores Mongo when updating PostgreSQL fails', async () => {
      solicitudesService.update.mockRejectedValue(
        new Error('PostgreSQL unavailable'),
      );

      await expect(
        service.procesarFirma('constancia-1', undefined, 123),
      ).rejects.toThrow('PostgreSQL unavailable');

      expect(mockConstanciaModel.findOneAndUpdate).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        expect.objectContaining({
          impreso: false,
          driveId: 'stored-original-id',
          url: 'original-url',
          originalTrashed: false,
        }),
        { new: true },
      );
      expect(uploadService.trashFile).not.toHaveBeenCalled();
    });

    it('does not trash the signed file during an idempotent retry', async () => {
      uploadService.findSignedVersion.mockResolvedValue({
        originalFile: { id: 'signed-id', name: '[FIRMADO] constancia-123.pdf' },
        signedFile: { id: 'signed-id', name: '[FIRMADO] constancia-123.pdf' },
      });

      await service.procesarFirma('constancia-1', undefined, 123);

      expect(uploadService.trashFile).not.toHaveBeenCalled();
    });
  });

  function mockFindOne(value: any): void {
    mockConstanciaModel.findOne.mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(value),
    });
  }
});
