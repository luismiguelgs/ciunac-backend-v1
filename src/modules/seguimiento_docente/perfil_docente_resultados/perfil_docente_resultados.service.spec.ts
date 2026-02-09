import { Test, TestingModule } from '@nestjs/testing';
import { PerfilDocenteResultadosService } from './perfil_docente_resultados.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilDocenteResultado } from './entities/perfil_docente_resultado.entity';

describe('PerfilDocenteResultadosService', () => {
  let service: PerfilDocenteResultadosService;
  let repository: Repository<PerfilDocenteResultado>;

  const mockPerfilDocenteResultadoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilDocenteResultadosService,
        {
          provide: getRepositoryToken(PerfilDocenteResultado),
          useValue: mockPerfilDocenteResultadoRepository,
        },
      ],
    }).compile();

    service = module.get<PerfilDocenteResultadosService>(PerfilDocenteResultadosService);
    repository = module.get<Repository<PerfilDocenteResultado>>(getRepositoryToken(PerfilDocenteResultado));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
