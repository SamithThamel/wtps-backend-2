import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('compliance')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post()
  @Roles('Supervisor', 'Utility Engineer', 'Consultant', 'Admin')
  async createRecord(@Body() data: any, @CurrentUser() user: any) {
    return this.complianceService.createRecord(data, user);
  }

  @Get()
  @Roles('Operator', 'Supervisor', 'Utility Engineer', 'Consultant', 'Upper Management', 'Business Owner', 'Admin')
  async getRecords() {
    return this.complianceService.getRecords();
  }
}
