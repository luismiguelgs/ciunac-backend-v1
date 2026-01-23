import { Test, TestingModule } from '@nestjs/testing';
import { EncuestaRespuestasDetalleController } from './encuesta_respuestas_detalle.controller';
import { EncuestaRespuestasDetalleService } from './encuesta_respuestas_detalle.service';

describe('EncuestaRespuestasDetalleController', () => {
  let controller: EncuestaRespuestasDetalleController;
  let service: EncuestaRespuestasDetalleService;

  const mockDetail = {
    id: 1,
    encuestaId: 1,
    preguntaId: 5,
    valorTexto: 'Excelente',
    valorNumero: 5,
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockDetail),
    findAll: jest.fn().mockResolvedValue([mockDetail]),
    findOne: jest.fn().mockResolvedValue(mockDetail),
    update: jest.fn().mockResolvedValue(mockDetail),
    remove: jest.fn().mockResolvedValue(mockDetail),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EncuestaRespuestasDetalleController],
      providers: [
        {
          provide: EncuestaRespuestasDetalleService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EncuestaRespuestasDetalleController>(EncuestaRespuestasDetalleController);
    service = module.get<EncuestaRespuestasDetalleService>(EncuestaRespuestasDetalleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new detail', async () => {
      const dto = { encuestaId: 1, preguntaId: 5, valorTexto: 'Bueno', valorNumero: 4 };
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockDetail);
    });
  });

  describe('findAll', () => {
    it('should return all details', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockDetail]);
    });
  });

  describe('findOne', () => {
    it('should return a detail by id', async () => {
      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDetail);
    });
  });

  describe('update', () => {
    it('should update a detail', async () => {
      const dto = { valorTexto: 'Regular' };
      const result = await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockDetail);
    });
  });

  describe('remove', () => {
    it('should remove a detail', async () => {
      const result = await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDetail);
    });
  });
});

