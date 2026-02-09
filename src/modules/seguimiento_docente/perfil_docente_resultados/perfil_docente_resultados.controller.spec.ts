import { Test, TestingModule } from '@nestjs/testing';
import { PerfilDocenteResultadosController } from './perfil_docente_resultados.controller';
import { PerfilDocenteResultadosService } from './perfil_docente_resultados.service';

describe('PerfilDocenteResultadosController', () => {
  let controller: PerfilDocenteResultadosController;

  const mockPerfilDocenteResultadosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerfilDocenteResultadosController],
      providers: [
        {
          provide: PerfilDocenteResultadosService,
          useValue: mockPerfilDocenteResultadosService,
        },
      ],
    }).compile();

    controller = module.get<PerfilDocenteResultadosController>(PerfilDocenteResultadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
