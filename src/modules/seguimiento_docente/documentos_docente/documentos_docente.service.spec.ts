import { Test, TestingModule } from '@nestjs/testing';
import { DocumentosDocenteService } from './documentos_docente.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DocumentosDocente } from './entities/documentos_docente.entity';

describe('DocumentosDocenteService', () => {
  let service: DocumentosDocenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentosDocenteService,
        {
          provide: getRepositoryToken(DocumentosDocente),
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

    service = module.get<DocumentosDocenteService>(DocumentosDocenteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
