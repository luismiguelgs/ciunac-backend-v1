import { Test, TestingModule } from '@nestjs/testing';
import { NotasfinalService } from './notasfinal.service';

describe('NotasfinalService', () => {
  let service: NotasfinalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotasfinalService],
    }).compile();

    service = module.get<NotasfinalService>(NotasfinalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
