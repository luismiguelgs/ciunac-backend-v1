import { Test, TestingModule } from '@nestjs/testing';
import { CertificadosService } from './certificados.service';
import { getModelToken } from '@nestjs/mongoose';
import { Certificado } from './schemas/certificado.schema';

describe('CertificadosService', () => {
  let service: CertificadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificadosService,
        { provide: getModelToken(Certificado.name), useValue: {} },
      ],
    }).compile();

    service = module.get<CertificadosService>(CertificadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
