import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { PERMISSIONS_KEY } from '../rbac.constants';
import { PermissionsService } from '../permissions.service';
import { RbacAuditService } from '../rbac-audit.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
    private readonly rbacAudit: RbacAuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthUserDto | undefined;
    if (!user?.id) {
      return false;
    }

    if (await this.permissionsService.hasSuperAdminRole(user.id)) {
      return true;
    }

    const allowed = await this.permissionsService.hasAnyPermission(
      user.id,
      required,
    );
    if (allowed) {
      return true;
    }

    await this.rbacAudit.logPermissionDenied({
      actorUserId: user.id,
      requiredPermissions: required,
      request,
    });

    throw new ForbiddenException('Accès refusé');
  }
}
