import { Test, TestingModule } from '@nestjs/testing';
import { TipossolicitudService } from './tipossolicitud.service';

describe('TipossolicitudService', () => {
  let service: TipossolicitudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipossolicitudService],
    }).compile();

    service = module.get<TipossolicitudService>(TipossolicitudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
