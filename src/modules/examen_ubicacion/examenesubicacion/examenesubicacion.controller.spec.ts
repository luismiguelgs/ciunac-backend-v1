import { Test, TestingModule } from '@nestjs/testing';
import { ExamenesubicacionController } from './examenesubicacion.controller';
import { ExamenesubicacionService } from './examenesubicacion.service';

describe('ExamenesubicacionController', () => {
  let controller: ExamenesubicacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamenesubicacionController],
      providers: [ExamenesubicacionService],
    }).compile();

    controller = module.get<ExamenesubicacionController>(ExamenesubicacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
