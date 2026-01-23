import { Test, TestingModule } from '@nestjs/testing';
import { CalificacionesubicacionService } from './calificacionesubicacion.service';

describe('CalificacionesubicacionService', () => {
  let service: CalificacionesubicacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalificacionesubicacionService],
    }).compile();

    service = module.get<CalificacionesubicacionService>(CalificacionesubicacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
