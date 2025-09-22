import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RBACUtils } from '../rbac.utils';
import { PERMISSION_KEY } from '../decorators/requiresPermission.decorator';
import { RequiredPermission } from '../permissions.enum';

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission =
      this.reflector.getAllAndOverride<RequiredPermission>(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasPermission = RBACUtils.hasPermission(
      user.role,
      requiredPermission
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions: ${requiredPermission.action} ${requiredPermission.resource}`
      );
    }

    return true;
  }
}
