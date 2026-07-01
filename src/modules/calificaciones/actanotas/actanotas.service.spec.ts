import { Test, TestingModule } from '@nestjs/testing';
import { ActanotasService } from './actanotas.service';
import { getModelToken } from '@nestjs/mongoose';

describe('ActanotasService', () => {
  let service: ActanotasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActanotasService,
        { provide: getModelToken('ActaNota'), useValue: {} },
      ],
    }).compile();

    service = module.get<ActanotasService>(ActanotasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
