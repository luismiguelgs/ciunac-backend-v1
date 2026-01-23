import { Test, TestingModule } from '@nestjs/testing';
import { Q10Service } from './q10.service';

describe('Q10Service', () => {
  let service: Q10Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Q10Service],
    }).compile();

    service = module.get<Q10Service>(Q10Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
