import { Test, TestingModule } from '@nestjs/testing';
import { Q10Controller } from './q10.controller';
import { Q10Service } from './q10.service';

describe('Q10Controller', () => {
  let controller: Q10Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Q10Controller],
      providers: [Q10Service],
    }).compile();

    controller = module.get<Q10Controller>(Q10Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
