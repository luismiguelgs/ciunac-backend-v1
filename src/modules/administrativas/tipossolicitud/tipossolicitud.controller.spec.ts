import { Test, TestingModule } from '@nestjs/testing';
import { TipossolicitudController } from './tipossolicitud.controller';
import { TipossolicitudService } from './tipossolicitud.service';

describe('TipossolicitudController', () => {
  let controller: TipossolicitudController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipossolicitudController],
      providers: [{ provide: TipossolicitudService, useValue: {} }],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<TipossolicitudController>(TipossolicitudController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
