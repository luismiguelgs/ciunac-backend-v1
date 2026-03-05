import { Test, TestingModule } from '@nestjs/testing';
import { DashboardDocentesController } from './dashboard_docentes.controller';
import { DashboardDocentesService } from './dashboard_docentes.service';

describe('DashboardDocentesController', () => {
  let controller: DashboardDocentesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardDocentesController],
      providers: [DashboardDocentesService],
    }).compile();

    controller = module.get<DashboardDocentesController>(DashboardDocentesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
