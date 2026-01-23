import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudbecasController } from './solicitudbecas.controller';
import { SolicitudbecasService } from './solicitudbecas.service';

describe('SolicitudbecasController', () => {
  let controller: SolicitudbecasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudbecasController],
      providers: [SolicitudbecasService],
    }).compile();

    controller = module.get<SolicitudbecasController>(SolicitudbecasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
