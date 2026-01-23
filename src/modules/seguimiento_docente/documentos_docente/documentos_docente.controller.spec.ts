import { Test, TestingModule } from '@nestjs/testing';
import { DocumentosDocenteController } from './documentos_docente.controller';
import { DocumentosDocenteService } from './documentos_docente.service';

describe('DocumentosDocenteController', () => {
  let controller: DocumentosDocenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentosDocenteController],
      providers: [
        {
          provide: DocumentosDocenteService,
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

    controller = module.get<DocumentosDocenteController>(DocumentosDocenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
