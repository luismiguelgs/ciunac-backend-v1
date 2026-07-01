/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EncuestaRespuestasController } from './encuesta_respuestas.controller';
import { EncuestaRespuestasService } from './encuesta_respuestas.service';
import { BadRequestException } from '@nestjs/common';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';

describe('EncuestaRespuestasController', () => {
  let controller: EncuestaRespuestasController;
  let service: EncuestaRespuestasService;

  const mockService = {
    uploadAndProcess: jest.fn(),
    findByDocenteAndModulo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EncuestaRespuestasController],
      providers: [
        {
          provide: EncuestaRespuestasService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EncuestaRespuestasController>(
      EncuestaRespuestasController,
    );
    service = module.get<EncuestaRespuestasService>(EncuestaRespuestasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should process a CSV file', async () => {
      const file = {
        buffer: Buffer.from('docente,modulo'),
        mimetype: 'text/csv',
        originalname: 'respuestas.csv',
      } as Express.Multer.File;
      const expected = { processed: 1 };
      mockService.uploadAndProcess.mockResolvedValue(expected);

      await expect(controller.uploadFile(file)).resolves.toEqual(expected);
      expect(service.uploadAndProcess).toHaveBeenCalledWith(file.buffer);
    });

    it('should reject a missing file', async () => {
      await expect(controller.uploadFile(undefined as never)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject a non-CSV file', async () => {
      const file = {
        buffer: Buffer.from('contenido'),
        mimetype: 'application/pdf',
        originalname: 'respuestas.pdf',
      } as Express.Multer.File;

      await expect(controller.uploadFile(file)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByDocenteAndModulo', () => {
    it('should convert moduloId and delegate the search', async () => {
      const expected = [{ docenteId: 'docente-1', moduloId: 5 }];
      mockService.findByDocenteAndModulo.mockResolvedValue(expected);

      await expect(
        controller.findByDocenteAndModulo('docente-1', '5'),
      ).resolves.toEqual(expected);
      expect(service.findByDocenteAndModulo).toHaveBeenCalledWith(
        'docente-1',
        5,
      );
    });
  });
});
