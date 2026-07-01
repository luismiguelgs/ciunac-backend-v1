import { Test, TestingModule } from '@nestjs/testing';
import { NotasController } from './notas.controller';
import { NotasService } from './notas.service';

describe('NotasController', () => {
  let controller: NotasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotasController],
      providers: [{ provide: NotasService, useValue: {} }],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<NotasController>(NotasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
