import { Module } from '@nestjs/common';
import { ConsultantLogController } from './consultant-log.controller';
import { ConsultantLogService } from './consultant-log.service';

@Module({
  controllers: [ConsultantLogController],
  providers: [ConsultantLogService],
  exports: [ConsultantLogService],
})
export class ConsultantLogModule {}
