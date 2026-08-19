import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';

describe('MailerService', () => {
  let service: MailerService;
  let alumnosSendMail: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailerService],
    }).compile();

    service = module.get<MailerService>(MailerService);
    alumnosSendMail = jest.fn();
    Object.defineProperty(service, 'transporters', {
      value: {
        alumnos: { sendMail: alumnosSendMail },
      },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sends password recovery only through the general account', async () => {
    const previousEmail = process.env.ALUMNOS_EMAIL_USER;
    process.env.ALUMNOS_EMAIL_USER = 'general@ciunac.edu.pe';

    try {
      await service.sendPasswordReset(
        'usuario@ciunac.edu.pe',
        'https://admin.ciunac.site/restablecer-contrasena?token=abc',
        30,
      );
    } finally {
      if (previousEmail === undefined) {
        delete process.env.ALUMNOS_EMAIL_USER;
      } else {
        process.env.ALUMNOS_EMAIL_USER = previousEmail;
      }
    }

    expect(alumnosSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'general@ciunac.edu.pe',
        to: 'usuario@ciunac.edu.pe',
        subject: 'CIUNAC - RECUPERACIÓN DE CONTRASEÑA',
      }),
    );
  });
});
