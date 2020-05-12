import { Test, TestingModule } from '@nestjs/testing';
import { AmrHttpService } from './amr-http.service';

describe('AmrHttpService', () => {
  let service: AmrHttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AmrHttpService],
    }).compile();

    service = module.get<AmrHttpService>(AmrHttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
