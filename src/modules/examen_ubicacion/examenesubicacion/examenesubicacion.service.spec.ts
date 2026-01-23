import { Test, TestingModule } from '@nestjs/testing';
import { ExamenesubicacionService } from './examenesubicacion.service';

describe('ExamenesubicacionService', () => {
  let service: ExamenesubicacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamenesubicacionService],
    }).compile();

    service = module.get<ExamenesubicacionService>(ExamenesubicacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
