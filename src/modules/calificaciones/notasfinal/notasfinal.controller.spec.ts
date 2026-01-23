import { Test, TestingModule } from '@nestjs/testing';
import { NotasfinalController } from './notasfinal.controller';
import { NotasfinalService } from './notasfinal.service';

describe('NotasfinalController', () => {
  let controller: NotasfinalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotasfinalController],
      providers: [NotasfinalService],
    }).compile();

    controller = module.get<NotasfinalController>(NotasfinalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
