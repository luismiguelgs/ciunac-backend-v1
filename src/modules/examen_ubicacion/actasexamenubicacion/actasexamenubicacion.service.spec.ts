import { Test, TestingModule } from '@nestjs/testing';
import { ActasexamenubicacionService } from './actasexamenubicacion.service';
import { getModelToken } from '@nestjs/mongoose';
import { ActaExamenUbicacion } from './schemas/actasexamenubicacion.schema';

describe('ActasexamenubicacionService', () => {
  let service: ActasexamenubicacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActasexamenubicacionService,
        { provide: getModelToken(ActaExamenUbicacion.name), useValue: {} },
      ],
    }).compile();

    service = module.get<ActasexamenubicacionService>(
      ActasexamenubicacionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
