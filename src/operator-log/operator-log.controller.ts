import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { OperatorLogService } from './operator-log.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('operator-log')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class OperatorLogController {
  constructor(private readonly operatorLogService: OperatorLogService) {}

  @Post()
  @Roles('Operator', 'Supervisor', 'Consultant', 'Admin')
  async submitLog(@Body() logData: any, @CurrentUser() user: any) {
    return this.operatorLogService.submitLog(logData, user);
  }

  @Get()
  @Roles('Operator', 'Supervisor', 'Utility Engineer', 'Consultant', 'Upper Management', 'Business Owner', 'Admin')
  async getLogs() {
    return this.operatorLogService.getLogs();
  }
}
