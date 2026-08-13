import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('maintenance')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @Roles('Operator', 'Supervisor', 'Utility Engineer', 'Admin')
  async createLog(@Body() data: any, @CurrentUser() user: any) {
    return this.maintenanceService.createLog(data, user);
  }

  @Get()
  @Roles('Operator', 'Supervisor', 'Utility Engineer', 'Consultant', 'Upper Management', 'Business Owner', 'Admin')
  async getLogs() {
    return this.maintenanceService.getLogs();
  }
}
