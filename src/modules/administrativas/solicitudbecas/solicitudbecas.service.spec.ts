import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudbecasService } from './solicitudbecas.service';

describe('SolicitudbecasService', () => {
  let service: SolicitudbecasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitudbecasService],
    }).compile();

    service = module.get<SolicitudbecasService>(SolicitudbecasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
