import { Test, TestingModule } from '@nestjs/testing';
import { DetallesubicacionService } from './detallesubicacion.service';

describe('DetallesubicacionService', () => {
  let service: DetallesubicacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetallesubicacionService],
    }).compile();

    service = module.get<DetallesubicacionService>(DetallesubicacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
