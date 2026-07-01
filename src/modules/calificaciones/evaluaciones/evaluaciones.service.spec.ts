import { Test, TestingModule } from '@nestjs/testing';
import { EvaluacionesService } from './evaluaciones.service';

describe('EvaluacionesService', () => {
  let service: EvaluacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluacionesService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<EvaluacionesService>(EvaluacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
