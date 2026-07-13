import { Test, TestingModule } from '@nestjs/testing';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';

describe('CertificadosController', () => {
  let controller: CertificadosController;
  const service = {
    subirArchivo: jest.fn(),
    procesarFirma: jest.fn(),
    findPendientes: jest.fn(),
    findFirmados: jest.fn(),
    findAceptados: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificadosController],
      providers: [{ provide: CertificadosService, useValue: service }],
    }).compile();

    controller = module.get<CertificadosController>(CertificadosController);
  });

  it('forwards the certificate upload to the service', async () => {
    const file = { originalname: 'certificado.pdf' } as Express.Multer.File;
    service.subirArchivo.mockResolvedValue({ success: true, id: 'drive-id' });

    await controller.subirArchivo('certificado-1', file, {
      fileId: 'previous-id',
    });

    expect(service.subirArchivo).toHaveBeenCalledWith(
      'certificado-1',
      file,
      'previous-id',
    );
  });

  it('forwards all signature compatibility fields', async () => {
    service.procesarFirma.mockResolvedValue({
      success: true,
      fileId: 'signed-id',
    });

    await controller.procesarFirma({
      certificadoId: 'certificado-1',
      fileId: 'original-id',
      solicitudId: 123,
      signedFileId: 'signed-id',
    });

    expect(service.procesarFirma).toHaveBeenCalledWith(
      'certificado-1',
      'original-id',
      123,
      'signed-id',
    );
  });
});
