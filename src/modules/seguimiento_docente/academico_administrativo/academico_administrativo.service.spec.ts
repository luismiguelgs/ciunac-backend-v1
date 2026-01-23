import { Test, TestingModule } from '@nestjs/testing';
import { AcademicoAdministrativoService } from './academico_administrativo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AcademicoAdministrativo } from './entities/academico_administrativo.entity';

describe('AcademicoAdministrativoService', () => {
  let service: AcademicoAdministrativoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicoAdministrativoService,
        {
          provide: getRepositoryToken(AcademicoAdministrativo),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AcademicoAdministrativoService>(AcademicoAdministrativoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
