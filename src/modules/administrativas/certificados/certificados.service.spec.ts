import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { SolicitudesService } from 'src/modules/administrativas/solicitudes/solicitudes.service';
import { UploadService } from 'src/shared/upload/upload.service';
import { CertificadosService } from './certificados.service';
import { Certificado, TipoCertificado } from './schemas/certificado.schema';

describe('CertificadosService', () => {
  let service: CertificadosService;
  let uploadService: {
    uploadToDrive: jest.Mock;
    getCertificatePeriodFolderId: jest.Mock;
    findSignedVersion: jest.Mock;
    moveFileToRepository: jest.Mock;
    trashFile: jest.Mock;
  };
  let solicitudesService: { findOne: jest.Mock; update: jest.Mock };

  const mockCertificado = {
    _id: new Types.ObjectId(),
    tipo: TipoCertificado.VIRTUAL,
    periodo: '202607',
    estudiante: 'Juan Perez',
    numeroDocumento: '12345678',
    idioma: 'INGLES',
    nivel: 'BASICO',
    solicitudId: 123,
    impreso: false,
    aceptado: false,
    driveId: 'stored-original-id',
    url: 'original-url',
  };

  const modelMethods = {
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
  Object.assign(MockModel, modelMethods);

  beforeEach(async () => {
    jest.clearAllMocks();
    uploadService = {
      uploadToDrive: jest.fn(),
      getCertificatePeriodFolderId: jest.fn(),
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
        CertificadosService,
        { provide: getModelToken(Certificado.name), useValue: MockModel },
        { provide: UploadService, useValue: uploadService },
        { provide: SolicitudesService, useValue: solicitudesService },
      ],
    }).compile();

    service = module.get<CertificadosService>(CertificadosService);
  });

  it('returns certificados grouped by workflow state', async () => {
    const exec = jest.fn().mockResolvedValue([mockCertificado]);
    modelMethods.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec,
    });

    await service.findPendientes();
    expect(modelMethods.find).toHaveBeenLastCalledWith({
      impreso: false,
      aceptado: false,
    });

    await service.findFirmados();
    expect(modelMethods.find).toHaveBeenLastCalledWith({
      impreso: true,
      aceptado: false,
    });

    await service.findAceptados();
    expect(modelMethods.find).toHaveBeenLastCalledWith({
      impreso: true,
      aceptado: true,
    });
  });

  it('uploads the initial file and stores its drive id', async () => {
    mockFindOne(mockCertificado);
    const file = {
      originalname: 'certificado.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('pdf'),
    } as Express.Multer.File;
    uploadService.uploadToDrive.mockResolvedValue({
      id: 'uploaded-id',
      name: 'certificate.pdf',
      folder: 'CERTIFICADOS',
      viewLink: 'view',
      downloadLink: 'download',
    });
    mockUpdateResult({ ...mockCertificado, driveId: 'uploaded-id' });

    const result = await service.subirArchivo(
      mockCertificado._id.toString(),
      file,
    );

    expect(uploadService.uploadToDrive).toHaveBeenCalledWith(
      file,
      'CERTIFICADOS',
      `${mockCertificado._id}-Juan Perez`,
      'stored-original-id',
    );
    expect(modelMethods.findOneAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      { driveId: 'uploaded-id' },
      { new: true },
    );
    expect(result).toMatchObject({ success: true, id: 'uploaded-id' });
  });

  it('rejects a non-PDF certificate file', async () => {
    const file = {
      originalname: 'certificado.png',
      mimetype: 'image/png',
      buffer: Buffer.from('image'),
    } as Express.Multer.File;

    await expect(
      service.subirArchivo(mockCertificado._id.toString(), file),
    ).rejects.toThrow(BadRequestException);
    expect(uploadService.uploadToDrive).not.toHaveBeenCalled();
  });

  describe('procesarFirma', () => {
    beforeEach(() => {
      mockFindOne(mockCertificado);
      solicitudesService.findOne.mockResolvedValue({ id: 123 });
      solicitudesService.update.mockResolvedValue({ id: 123, estadoId: 3 });
      uploadService.getCertificatePeriodFolderId.mockResolvedValue(
        'period-folder',
      );
      uploadService.findSignedVersion.mockResolvedValue({
        originalFile: {
          id: 'stored-original-id',
          name: 'certificado-123.pdf',
        },
        signedFile: {
          id: 'signed-id',
          name: 'certificado-123[FIRMADO].pdf',
        },
      });
      uploadService.moveFileToRepository.mockResolvedValue({
        id: 'signed-id',
        name: 'certificado-123[FIRMADO].pdf',
        viewLink: 'signed-view',
        downloadLink: 'signed-download',
      });
      uploadService.trashFile.mockResolvedValue(undefined);
      mockUpdateResult({ ...mockCertificado, driveId: 'signed-id' });
    });

    it('archives the signed file in its period and updates both stores', async () => {
      const result = await service.procesarFirma(
        mockCertificado._id.toString(),
        'stale-id',
        123,
      );

      expect(
        uploadService.getCertificatePeriodFolderId,
      ).toHaveBeenCalledWith('202607');
      expect(uploadService.findSignedVersion).toHaveBeenCalledWith(
        'stored-original-id',
        undefined,
        'period-folder',
      );
      expect(uploadService.moveFileToRepository).toHaveBeenCalledWith(
        'signed-id',
        'period-folder',
      );
      expect(modelMethods.findOneAndUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          impreso: true,
          driveId: 'signed-id',
          url: 'https://drive.google.com/uc?export=download&id=signed-id',
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
        name: 'certificado-123[FIRMADO].pdf',
        viewLink:
          'https://drive.google.com/uc?export=download&id=signed-id',
        originalTrashed: true,
      });
    });

    it('does not mutate state when the period folder is missing', async () => {
      uploadService.getCertificatePeriodFolderId.mockRejectedValue(
        new NotFoundException('Periodo no configurado'),
      );

      await expect(
        service.procesarFirma(mockCertificado._id.toString(), undefined, 123),
      ).rejects.toThrow(NotFoundException);

      expect(uploadService.findSignedVersion).not.toHaveBeenCalled();
      expect(modelMethods.findOneAndUpdate).not.toHaveBeenCalled();
      expect(solicitudesService.update).not.toHaveBeenCalled();
    });

    it('does not mutate state when the signed file is missing', async () => {
      uploadService.findSignedVersion.mockRejectedValue(
        new NotFoundException('Firmado no encontrado'),
      );

      await expect(
        service.procesarFirma(mockCertificado._id.toString(), undefined, 123),
      ).rejects.toThrow(NotFoundException);

      expect(uploadService.moveFileToRepository).not.toHaveBeenCalled();
      expect(modelMethods.findOneAndUpdate).not.toHaveBeenCalled();
      expect(solicitudesService.update).not.toHaveBeenCalled();
    });

    it('rejects a solicitud id that belongs to another request', async () => {
      await expect(
        service.procesarFirma(mockCertificado._id.toString(), undefined, 999),
      ).rejects.toThrow(BadRequestException);

      expect(solicitudesService.findOne).not.toHaveBeenCalled();
      expect(
        uploadService.getCertificatePeriodFolderId,
      ).not.toHaveBeenCalled();
    });

    it('fails when no stored or fallback drive id exists', async () => {
      mockFindOne({ ...mockCertificado, driveId: undefined });

      await expect(
        service.procesarFirma(mockCertificado._id.toString(), undefined, 123),
      ).rejects.toThrow(BadRequestException);

      expect(
        uploadService.getCertificatePeriodFolderId,
      ).not.toHaveBeenCalled();
    });

    it('restores Mongo when updating PostgreSQL fails', async () => {
      solicitudesService.update.mockRejectedValue(
        new Error('PostgreSQL unavailable'),
      );

      await expect(
        service.procesarFirma(mockCertificado._id.toString(), undefined, 123),
      ).rejects.toThrow('PostgreSQL unavailable');

      expect(modelMethods.findOneAndUpdate).toHaveBeenNthCalledWith(
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

    it('returns success with a warning when trashing the original fails', async () => {
      uploadService.trashFile.mockRejectedValue(new Error('Drive unavailable'));

      const result = await service.procesarFirma(
        mockCertificado._id.toString(),
        undefined,
        123,
      );

      expect(result.success).toBe(true);
      expect(result.originalTrashed).toBe(false);
      expect(result.warning).toContain('archivo original');
    });

    it('retries cleanup with the stored original id', async () => {
      mockFindOne({
        ...mockCertificado,
        impreso: true,
        driveId: 'signed-id',
        driveIdOriginal: 'stored-original-id',
        originalTrashed: false,
      });

      await service.procesarFirma(mockCertificado._id.toString(), undefined);

      expect(uploadService.findSignedVersion).toHaveBeenCalledWith(
        'stored-original-id',
        'signed-id',
        'period-folder',
      );
      expect(uploadService.trashFile).toHaveBeenCalledWith(
        'stored-original-id',
      );
    });
  });

  function mockFindOne(value: any): void {
    modelMethods.findOne.mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(value),
    });
  }

  function mockUpdateResult(value: any): void {
    modelMethods.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(value),
    });
  }
});
