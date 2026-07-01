import { Test, TestingModule } from '@nestjs/testing';
import { TextosService } from './textos.service';
import { getModelToken } from '@nestjs/mongoose';
import { Texto } from './schemas/texto.schema';

describe('TextosService', () => {
  let service: TextosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextosService,
        { provide: getModelToken(Texto.name), useValue: {} },
      ],
    }).compile();

    service = module.get<TextosService>(TextosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
