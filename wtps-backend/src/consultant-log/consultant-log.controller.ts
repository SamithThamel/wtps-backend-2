import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ConsultantLogService } from './consultant-log.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('consultant-log')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class ConsultantLogController {
  constructor(private readonly consultantLogService: ConsultantLogService) {}

  @Post()
  @Roles('Consultant', 'Admin')
  async createLog(@Body() data: any, @CurrentUser() user: any) {
    return this.consultantLogService.createLog(data, user);
  }

  @Get()
  @Roles('Supervisor', 'Utility Engineer', 'Consultant', 'Upper Management', 'Business Owner', 'Admin')
  async getLogs() {
    return this.consultantLogService.getLogs();
  }
}
