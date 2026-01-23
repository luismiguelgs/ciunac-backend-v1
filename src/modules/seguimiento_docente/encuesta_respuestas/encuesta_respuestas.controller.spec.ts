import { Test, TestingModule } from '@nestjs/testing';
import { EncuestaRespuestasController } from './encuesta_respuestas.controller';
import { EncuestaRespuestasService } from './encuesta_respuestas.service';

describe('EncuestaRespuestasController', () => {
  let controller: EncuestaRespuestasController;
  let service: EncuestaRespuestasService;

  const mockEncuestaRespuesta = {
    id: 1,
    grupoId: 10,
    promedioPonderado: 18,
    creadoEn: new Date(),
    modificadoEn: new Date(),
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockEncuestaRespuesta),
    findAll: jest.fn().mockResolvedValue([mockEncuestaRespuesta]),
    findOne: jest.fn().mockResolvedValue(mockEncuestaRespuesta),
    update: jest.fn().mockResolvedValue(mockEncuestaRespuesta),
    remove: jest.fn().mockResolvedValue(mockEncuestaRespuesta),
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
    }).compile();

    controller = module.get<EncuestaRespuestasController>(EncuestaRespuestasController);
    service = module.get<EncuestaRespuestasService>(EncuestaRespuestasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new response', async () => {
      const dto = { grupoId: 10, promedioPonderado: 18 };
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockEncuestaRespuesta);
    });
  });

  describe('findAll', () => {
    it('should return an array of responses', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockEncuestaRespuesta]);
    });
  });

  describe('findOne', () => {
    it('should return a response by id', async () => {
      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEncuestaRespuesta);
    });
  });

  describe('update', () => {
    it('should update a response', async () => {
      const dto = { promedioPonderado: 20 };
      const result = await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockEncuestaRespuesta);
    });
  });

  describe('remove', () => {
    it('should remove a response', async () => {
      const result = await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEncuestaRespuesta);
    });
  });
});

