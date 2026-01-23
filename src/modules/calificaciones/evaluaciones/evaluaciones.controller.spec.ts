import { Test, TestingModule } from '@nestjs/testing';
import { EvaluacionesController } from './evaluaciones.controller';
import { EvaluacionesService } from './evaluaciones.service';

describe('EvaluacionesController', () => {
  let controller: EvaluacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluacionesController],
      providers: [EvaluacionesService],
    }).compile();

    controller = module.get<EvaluacionesController>(EvaluacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
