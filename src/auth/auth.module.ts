import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthGuard, RolesGuard],
  exports: [AuthService, FirebaseAuthGuard, RolesGuard],
})
export class AuthModule {}
