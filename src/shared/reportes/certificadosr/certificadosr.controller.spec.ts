import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';
import { CertificadosrController } from './certificadosr.controller';
import { CertificadosrService } from './certificadosr.service';

describe('CertificadosrController', () => {
  let controller: CertificadosrController;
  let findAll: jest.Mock;

  beforeEach(async () => {
    findAll = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificadosrController],
      providers: [
        {
          provide: CertificadosrService,
          useValue: { findAll },
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CertificadosrController>(CertificadosrController);
  });

  it('debe devolver el reporte generado por el servicio', async () => {
    const reporte = {
      basico: { digitales: [], fisicos: [] },
      intermedioAvanzado: { digitales: [], fisicos: [] },
    };
    findAll.mockResolvedValue(reporte);

    await expect(controller.findAll()).resolves.toEqual(reporte);
    expect(findAll).toHaveBeenCalledTimes(1);
  });
});
