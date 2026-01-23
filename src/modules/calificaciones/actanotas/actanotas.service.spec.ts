import { Test, TestingModule } from '@nestjs/testing';
import { ActanotasService } from './actanotas.service';

describe('ActanotasService', () => {
  let service: ActanotasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActanotasService],
    }).compile();

    service = module.get<ActanotasService>(ActanotasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
