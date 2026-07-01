import { Test, TestingModule } from '@nestjs/testing';
import { EscuelasController } from './escuelas.controller';
import { EscuelasService } from './escuelas.service';

describe('EscuelasController', () => {
  let controller: EscuelasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EscuelasController],
      providers: [{ provide: EscuelasService, useValue: {} }],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<EscuelasController>(EscuelasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
