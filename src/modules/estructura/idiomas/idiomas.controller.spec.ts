import { Test, TestingModule } from '@nestjs/testing';
import { IdiomasController } from './idiomas.controller';
import { IdiomasService } from './idiomas.service';

describe('IdiomasController', () => {
  let controller: IdiomasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdiomasController],
      providers: [IdiomasService],
    }).compile();

    controller = module.get<IdiomasController>(IdiomasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
