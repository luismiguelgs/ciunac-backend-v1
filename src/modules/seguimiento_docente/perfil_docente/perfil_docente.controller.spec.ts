import { Test, TestingModule } from '@nestjs/testing';
import { PerfilDocenteController } from './perfil_docente.controller';
import { PerfilDocenteService } from './perfil_docente.service';

describe('PerfilDocenteController', () => {
  let controller: PerfilDocenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerfilDocenteController],
      providers: [PerfilDocenteService],
    }).compile();

    controller = module.get<PerfilDocenteController>(PerfilDocenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
