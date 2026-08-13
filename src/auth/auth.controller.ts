import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.registerUser(dto);
  }

  @Post('sync')
  @UseGuards(FirebaseAuthGuard)
  async sync(@CurrentUser() user: any) {
    return this.authService.syncUser(user.uid, user.name, user.email);
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async getMe(@CurrentUser() user: any) {
    return this.authService.getMe(user.uid);
  }

  @Get('users')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('Admin')
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Patch('users/:uid/role')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('Admin')
  async updateUserRole(
    @Param('uid') uid: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.authService.updateUserRole(uid, updateRoleDto.role);
  }
}
