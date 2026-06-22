import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudesController } from './solicitudes.controller';
import { SolicitudesService } from './solicitudes.service';

describe('SolicitudesController', () => {
  let controller: SolicitudesController;
  let service: { reject: jest.Mock };

  beforeEach(async () => {
    service = {
      reject: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudesController],
      providers: [
        {
          provide: SolicitudesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<SolicitudesController>(SolicitudesController);
  });

  it('should delegate the rejection to the service', async () => {
    const expected = {
      solicitud: { id: 10, estadoId: 5, observaciones: 'Motivo' },
      notificacion: { estado: 'ENVIADA' },
    };
    service.reject.mockResolvedValue(expected);

    const result = await controller.reject(10, {
      observaciones: 'Motivo',
    });

    expect(service.reject).toHaveBeenCalledWith(10, {
      observaciones: 'Motivo',
    });
    expect(result).toBe(expected);
  });
});
