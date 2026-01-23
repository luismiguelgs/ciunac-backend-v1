import { Test, TestingModule } from '@nestjs/testing';
import { DetallesubicacionController } from './detallesubicacion.controller';
import { DetallesubicacionService } from './detallesubicacion.service';

describe('DetallesubicacionController', () => {
  let controller: DetallesubicacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetallesubicacionController],
      providers: [DetallesubicacionService],
    }).compile();

    controller = module.get<DetallesubicacionController>(DetallesubicacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
