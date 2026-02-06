import { Test, TestingModule } from '@nestjs/testing';
import { EncuestaMetricasDocenteService } from './encuesta_metricas_docente.service';

describe('EncuestaMetricasDocenteService', () => {
  let service: EncuestaMetricasDocenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncuestaMetricasDocenteService],
    }).compile();

    service = module.get<EncuestaMetricasDocenteService>(EncuestaMetricasDocenteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
