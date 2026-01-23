import { Test, TestingModule } from '@nestjs/testing';
import { NivelesController } from './niveles.controller';
import { NivelesService } from './niveles.service';

describe('NivelesController', () => {
  let controller: NivelesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NivelesController],
      providers: [NivelesService],
    }).compile();

    controller = module.get<NivelesController>(NivelesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
