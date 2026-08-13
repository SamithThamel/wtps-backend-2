import { Test, TestingModule } from '@nestjs/testing';
import { OperatorLogService } from './operator-log.service';

describe('OperatorLogService', () => {
  let service: OperatorLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OperatorLogService],
    }).compile();

    service = module.get<OperatorLogService>(OperatorLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
