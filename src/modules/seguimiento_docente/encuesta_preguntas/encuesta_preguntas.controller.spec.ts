import { Test, TestingModule } from '@nestjs/testing';
import { EncuestaPreguntasController } from './encuesta_preguntas.controller';
import { EncuestaPreguntasService } from './encuesta_preguntas.service';

describe('EncuestaPreguntasController', () => {
  let controller: EncuestaPreguntasController;
  let service: EncuestaPreguntasService;

  const mockEncuestaPregunta = {
    id: 1,
    orden: 1,
    textoPregunta: '¿Qué tan satisfecho está?',
    dimension: 'Satisfacción',
    activo: true,
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockEncuestaPregunta),
    findAll: jest.fn().mockResolvedValue([mockEncuestaPregunta]),
    findOne: jest.fn().mockResolvedValue(mockEncuestaPregunta),
    update: jest.fn().mockResolvedValue(mockEncuestaPregunta),
    remove: jest.fn().mockResolvedValue(mockEncuestaPregunta),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EncuestaPreguntasController],
      providers: [
        {
          provide: EncuestaPreguntasService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EncuestaPreguntasController>(EncuestaPreguntasController);
    service = module.get<EncuestaPreguntasService>(EncuestaPreguntasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new question', async () => {
      const dto = { orden: 1, textoPregunta: 'Test' };
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockEncuestaPregunta);
    });
  });

  describe('findAll', () => {
    it('should return an array of questions', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockEncuestaPregunta]);
    });
  });

  describe('findOne', () => {
    it('should return a question by id', async () => {
      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEncuestaPregunta);
    });
  });

  describe('update', () => {
    it('should update a question', async () => {
      const dto = { textoPregunta: 'Updated Text' };
      const result = await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockEncuestaPregunta);
    });
  });

  describe('remove', () => {
    it('should remove a question', async () => {
      const result = await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEncuestaPregunta);
    });
  });
});

