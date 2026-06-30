import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  override getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ query?: { next?: string } }>();
    const next = request.query?.next;
    return {
      scope: ['profile', 'email'],
      state: typeof next === 'string' ? next : '/booking/cart',
    };
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch {
      this.redirectOAuthFailure(context);
      return false;
    }
  }

  override handleRequest<TUser>(
    err: unknown,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      this.redirectOAuthFailure(context);
      throw new UnauthorizedException('Google authentication failed');
    }
    return user;
  }

  private redirectOAuthFailure(context: ExecutionContext): void {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<{
      query?: { state?: string; next?: string };
    }>();
    const next =
      typeof request.query?.state === 'string'
        ? request.query.state
        : typeof request.query?.next === 'string'
          ? request.query.next
          : undefined;

    if (!response.headersSent) {
      response.redirect(this.authService.buildWebOAuthErrorUrl(next));
    }
  }
}
