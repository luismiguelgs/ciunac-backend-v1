import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { SolicitudesController } from '../src/modules/administrativas/solicitudes/solicitudes.controller';
import { SolicitudesService } from '../src/modules/administrativas/solicitudes/solicitudes.service';

describe('Solicitud rejection (e2e)', () => {
  let app: INestApplication<App>;
  let solicitudesService: { reject: jest.Mock };
  const previousApiKey = process.env.API_KEY;

  beforeAll(async () => {
    process.env.API_KEY = 'test-api-key';
    solicitudesService = {
      reject: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudesController],
      providers: [
        {
          provide: SolicitudesService,
          useValue: solicitudesService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    process.env.API_KEY = previousApiKey;
  });

  it('PATCH /solicitudes/:id/rechazo rejects and returns notification status', async () => {
    solicitudesService.reject.mockResolvedValue({
      solicitud: {
        id: 10,
        estadoId: 5,
        observaciones: 'Voucher invalido',
      },
      notificacion: { estado: 'ENVIADA' },
    });

    await request(app.getHttpServer())
      .patch('/solicitudes/10/rechazo')
      .set('x-api-key', 'test-api-key')
      .send({ observaciones: 'Voucher invalido' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.notificacion).toEqual({ estado: 'ENVIADA' });
      });

    expect(solicitudesService.reject).toHaveBeenCalledWith(10, {
      observaciones: 'Voucher invalido',
    });
  });

  it('rejects empty observations', async () => {
    await request(app.getHttpServer())
      .patch('/solicitudes/10/rechazo')
      .set('x-api-key', 'test-api-key')
      .send({ observaciones: '   ' })
      .expect(400);
  });

  it('rejects requests without API key', async () => {
    await request(app.getHttpServer())
      .patch('/solicitudes/10/rechazo')
      .send({ observaciones: 'Voucher invalido' })
      .expect(401);
  });
});
