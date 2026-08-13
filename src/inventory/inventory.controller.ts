import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('inventory')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles('Supervisor', 'Utility Engineer', 'Admin')
  async addItem(@Body() data: any, @CurrentUser() user: any) {
    return this.inventoryService.addItem(data, user);
  }

  @Get()
  @Roles('Operator', 'Supervisor', 'Utility Engineer', 'Consultant', 'Upper Management', 'Business Owner', 'Admin')
  async getInventory() {
    return this.inventoryService.getInventory();
  }
}
