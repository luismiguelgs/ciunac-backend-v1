import { Test, TestingModule } from '@nestjs/testing';
import { PuntajeAcademicoAdministrativoController } from './puntaje_academico_administrativo.controller';
import { PuntajeAcademicoAdministrativoService } from './puntaje_academico_administrativo.service';

describe('PuntajeAcademicoAdministrativoController', () => {
  let controller: PuntajeAcademicoAdministrativoController;
  let service: PuntajeAcademicoAdministrativoService;

  const mockPuntaje = {
    id: 1,
    academicoAdministrativoId: 1,
    nombre: 'Test Puntaje',
    puntaje: 10,
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockPuntaje),
    findAll: jest.fn().mockResolvedValue([mockPuntaje]),
    findOne: jest.fn().mockResolvedValue(mockPuntaje),
    update: jest.fn().mockResolvedValue(mockPuntaje),
    remove: jest.fn().mockResolvedValue(mockPuntaje),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PuntajeAcademicoAdministrativoController],
      providers: [
        {
          provide: PuntajeAcademicoAdministrativoService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PuntajeAcademicoAdministrativoController>(PuntajeAcademicoAdministrativoController);
    service = module.get<PuntajeAcademicoAdministrativoService>(PuntajeAcademicoAdministrativoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a puntaje', async () => {
      const dto = { academico_administrativo_id: 1, nombre: 'Test', puntaje: 10 };
      expect(await controller.create(dto)).toEqual(mockPuntaje);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of puntajes', async () => {
      expect(await controller.findAll()).toEqual([mockPuntaje]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a puntaje', async () => {
      expect(await controller.findOne(1)).toEqual(mockPuntaje);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a puntaje', async () => {
      const dto = { nombre: 'Updated' };
      expect(await controller.update(1, dto)).toEqual(mockPuntaje);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a puntaje', async () => {
      expect(await controller.remove(1)).toEqual(mockPuntaje);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
