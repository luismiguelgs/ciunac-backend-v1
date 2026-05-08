import { Test, TestingModule } from '@nestjs/testing';
import { ConstanciasService } from './constancias.service';
import { getModelToken } from '@nestjs/mongoose';
import { Constancia } from './schemas/constancia.schema';
import { Types } from 'mongoose';

describe('ConstanciasService', () => {
  let service: ConstanciasService;
  let model: any;

  const mockConstancia = {
    _id: new Types.ObjectId(),
    tipo: 'MATRICULA',
    estudiante: 'Juan Perez',
    dni: '12345678',
    idioma: 'INGLES',
    nivel: 'BASICO',
    ciclo: 'I',
    impreso: false,
    aceptado: false,
    solicitud_id: 123,
    modalidad: 'REGULAR',
    toObject: jest.fn().mockReturnThis(),
  };

  const mockConstanciaModel = {
    new: jest.fn().mockImplementation((dto) => ({
      ...dto,
      _id: new Types.ObjectId(),
      save: jest.fn().mockResolvedValue({
        ...dto,
        _id: new Types.ObjectId(),
        toObject: jest.fn().mockReturnValue({ ...dto, _id: new Types.ObjectId() }),
      }),
    })),
    constructor: jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({
        ...dto,
        toObject: jest.fn().mockReturnValue({ ...dto }),
      }),
    })),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    create: jest.fn(),
  };

  // Mongoose models are both functions (constructors) and objects (with methods like find)
  function MockModel(dto: any) {
    this.data = dto;
    this.save = jest.fn().mockResolvedValue({
      toObject: jest.fn().mockReturnValue({ ...dto, _id: new Types.ObjectId() }),
    });
  }
  Object.assign(MockModel, mockConstanciaModel);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConstanciasService,
        {
          provide: getModelToken(Constancia.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<ConstanciasService>(ConstanciasService);
    model = module.get(getModelToken(Constancia.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all constancias', async () => {
      const result = [mockConstancia];
      mockConstanciaModel.find.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(result),
      });

      const constancias = await service.findAll();
      expect(constancias).toHaveLength(1);
      expect(constancias[0]._id).toBeDefined();
    });
  });

  describe('findPendientes', () => {
    it('should return pending constancias', async () => {
      const result = [mockConstancia];
      mockConstanciaModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(result),
      });

      const constancias = await service.findPendientes();
      expect(model.find).toHaveBeenCalledWith({ impreso: false, aceptado: false });
      expect(constancias).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a constancia by id', async () => {
      const id = new Types.ObjectId().toHexString();
      mockConstanciaModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockConstancia),
      });

      const constancia = await service.findOne(id);
      expect(constancia).toBeDefined();
      expect(constancia?._id).toBeDefined();
    });

    it('should return null if not found', async () => {
      mockConstanciaModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const constancia = await service.findOne('nonexistent');
      expect(constancia).toBeNull();
    });
  });
});
