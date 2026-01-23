import { Test, TestingModule } from '@nestjs/testing';
import { AcademicoAdministrativoController } from './academico_administrativo.controller';
import { AcademicoAdministrativoService } from './academico_administrativo.service';

describe('AcademicoAdministrativoController', () => {
  let controller: AcademicoAdministrativoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcademicoAdministrativoController],
      providers: [
        {
          provide: AcademicoAdministrativoService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AcademicoAdministrativoController>(AcademicoAdministrativoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
