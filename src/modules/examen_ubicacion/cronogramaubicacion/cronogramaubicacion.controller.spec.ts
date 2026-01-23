import { Test, TestingModule } from '@nestjs/testing';
import { CronogramaubicacionController } from './cronogramaubicacion.controller';
import { CronogramaubicacionService } from './cronogramaubicacion.service';

describe('CronogramaubicacionController', () => {
  let controller: CronogramaubicacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CronogramaubicacionController],
      providers: [CronogramaubicacionService],
    }).compile();

    controller = module.get<CronogramaubicacionController>(CronogramaubicacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
