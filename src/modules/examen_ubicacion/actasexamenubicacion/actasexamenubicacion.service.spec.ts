import { Test, TestingModule } from '@nestjs/testing';
import { ActasexamenubicacionService } from './actasexamenubicacion.service';

describe('ActasexamenubicacionService', () => {
  let service: ActasexamenubicacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActasexamenubicacionService],
    }).compile();

    service = module.get<ActasexamenubicacionService>(ActasexamenubicacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
