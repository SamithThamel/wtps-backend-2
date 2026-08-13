import { Test, TestingModule } from '@nestjs/testing';
import { OperatorLogController } from './operator-log.controller';

describe('OperatorLogController', () => {
  let controller: OperatorLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperatorLogController],
    }).compile();

    controller = module.get<OperatorLogController>(OperatorLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
