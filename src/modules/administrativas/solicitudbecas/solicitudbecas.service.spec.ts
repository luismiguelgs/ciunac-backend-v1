import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudbecasService } from './solicitudbecas.service';
import { getModelToken } from '@nestjs/mongoose';
import { SolicitudBeca } from './schemas/solicitudbeca.schema';

describe('SolicitudbecasService', () => {
  let service: SolicitudbecasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitudbecasService,
        { provide: getModelToken(SolicitudBeca.name), useValue: {} },
      ],
    }).compile();

    service = module.get<SolicitudbecasService>(SolicitudbecasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
