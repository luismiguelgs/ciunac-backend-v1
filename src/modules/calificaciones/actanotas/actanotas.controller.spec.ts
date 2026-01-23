import { Test, TestingModule } from '@nestjs/testing';
import { ActanotasController } from './actanotas.controller';
import { ActanotasService } from './actanotas.service';

describe('ActanotasController', () => {
  let controller: ActanotasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActanotasController],
      providers: [ActanotasService],
    }).compile();

    controller = module.get<ActanotasController>(ActanotasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
