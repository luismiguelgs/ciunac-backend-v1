import { Test, TestingModule } from '@nestjs/testing';
import { TipoDocumentoPerfilController } from './tipo_documento_perfil.controller';
import { TipoDocumentoPerfilService } from './tipo_documento_perfil.service';

describe('TipoDocumentoPerfilController', () => {
  let controller: TipoDocumentoPerfilController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoDocumentoPerfilController],
      providers: [TipoDocumentoPerfilService],
    }).compile();

    controller = module.get<TipoDocumentoPerfilController>(TipoDocumentoPerfilController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
