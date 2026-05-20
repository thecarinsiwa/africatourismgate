import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { PermissionsService } from '../permissions.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly permissionsService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthUserDto | undefined;
    if (!user?.id) {
      return false;
    }

    if (await this.permissionsService.hasSuperAdminRole(user.id)) {
      return true;
    }

    throw new ForbiddenException('Réservé au super administrateur');
  }
}
