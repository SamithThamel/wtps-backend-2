import { Module } from '@nestjs/common';
import { OperatorLogController } from './operator-log.controller';
import { OperatorLogService } from './operator-log.service';

@Module({
  controllers: [OperatorLogController],
  providers: [OperatorLogService],
  exports: [OperatorLogService],
})
export class OperatorLogModule {}
