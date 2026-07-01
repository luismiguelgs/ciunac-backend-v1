import { Test, TestingModule } from '@nestjs/testing';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';

describe('CertificadosController', () => {
  let controller: CertificadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificadosController],
      providers: [{ provide: CertificadosService, useValue: {} }],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<CertificadosController>(CertificadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
