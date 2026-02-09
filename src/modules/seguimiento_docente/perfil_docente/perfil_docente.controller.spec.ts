import { Test, TestingModule } from '@nestjs/testing';
import { PerfilDocenteController } from './perfil_docente.controller';
import { PerfilDocenteService } from './perfil_docente.service';

describe('PerfilDocenteController', () => {
  let controller: PerfilDocenteController;

  const mockPerfilDocenteService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerfilDocenteController],
      providers: [
        {
          provide: PerfilDocenteService,
          useValue: mockPerfilDocenteService,
        },
      ],
    }).compile();

    controller = module.get<PerfilDocenteController>(PerfilDocenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
