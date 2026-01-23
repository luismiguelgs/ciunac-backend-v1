import { Test, TestingModule } from '@nestjs/testing';
import { ActasexamenubicacionController } from './actasexamenubicacion.controller';
import { ActasexamenubicacionService } from './actasexamenubicacion.service';

describe('ActasexamenubicacionController', () => {
  let controller: ActasexamenubicacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActasexamenubicacionController],
      providers: [ActasexamenubicacionService],
    }).compile();

    controller = module.get<ActasexamenubicacionController>(ActasexamenubicacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
