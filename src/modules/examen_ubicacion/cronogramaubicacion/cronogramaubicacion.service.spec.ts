import { Test, TestingModule } from '@nestjs/testing';
import { CronogramaubicacionService } from './cronogramaubicacion.service';

describe('CronogramaubicacionService', () => {
  let service: CronogramaubicacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CronogramaubicacionService],
    }).compile();

    service = module.get<CronogramaubicacionService>(CronogramaubicacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
