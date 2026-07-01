import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';
import { TiemposController } from './tiempos.controller';
import { TiemposService } from './tiempos.service';

describe('TiemposController', () => {
  let controller: TiemposController;
  let findAll: jest.Mock;

  beforeEach(async () => {
    findAll = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiemposController],
      providers: [
        {
          provide: TiemposService,
          useValue: { findAll },
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TiemposController>(TiemposController);
  });

  it('debe devolver el reporte generado por el servicio', async () => {
    const reporte = [
      {
        certificadoId: 'certificado-1',
        solicitudId: 10,
        tipoSolicitud: 'Certificado de estudios',
        periodo: '2026-I',
        formatoCertificado: 'DIGITAL' as const,
        fechaSolicitud: new Date('2026-06-01T08:00:00.000Z'),
        fechaEmision: new Date('2026-06-02T18:30:00.000Z'),
        tiempoHoras: 34.5,
      },
    ];
    findAll.mockResolvedValue(reporte);

    await expect(controller.findAll()).resolves.toEqual(reporte);
    expect(findAll).toHaveBeenCalledTimes(1);
  });
});
