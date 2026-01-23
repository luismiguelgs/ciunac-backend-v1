import { Test, TestingModule } from '@nestjs/testing';
import { CalificacionesubicacionController } from './calificacionesubicacion.controller';
import { CalificacionesubicacionService } from './calificacionesubicacion.service';

describe('CalificacionesubicacionController', () => {
  let controller: CalificacionesubicacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalificacionesubicacionController],
      providers: [CalificacionesubicacionService],
    }).compile();

    controller = module.get<CalificacionesubicacionController>(CalificacionesubicacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
