import { Test, TestingModule } from '@nestjs/testing';
import { EncuestaMetricasDocenteController } from './encuesta_metricas_docente.controller';
import { EncuestaMetricasDocenteService } from './encuesta_metricas_docente.service';

describe('EncuestaMetricasDocenteController', () => {
  let controller: EncuestaMetricasDocenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EncuestaMetricasDocenteController],
      providers: [EncuestaMetricasDocenteService],
    }).compile();

    controller = module.get<EncuestaMetricasDocenteController>(EncuestaMetricasDocenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
