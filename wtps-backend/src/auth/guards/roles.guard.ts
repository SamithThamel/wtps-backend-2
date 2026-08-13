import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('User role not assigned.');
    }

    // Admin has access to everything
    if (user.role === 'Admin') {
      return true;
    }

    const hasRole = requiredRoles.some((role) => {
      if (role === 'Upper Management' || role === 'Business Owner') {
        return user.role === 'Upper Management' || user.role === 'Business Owner' || user.role === 'Upper Management / Business Owner';
      }
      return user.role === role;
    });

    if (!hasRole) {
      throw new ForbiddenException(`Access denied. Requires one of roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
