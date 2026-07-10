import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from '../auth.service';
import { safeOAuthRedirect } from '../oauth-redirect.util';
import { decodeOAuthState, encodeOAuthState, type OAuthContext } from '../oauth-state.util';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  override getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      query?: { next?: string; web_origin?: string; context?: string };
    }>();
    const next = request.query?.next;
    const webOrigin = request.query?.web_origin;
    const rawContext = request.query?.context;
    const oauthContext: OAuthContext | undefined =
      rawContext === 'admin_register' ? 'admin_register' : undefined;
    const nextPath =
      typeof next === 'string'
        ? next
        : oauthContext === 'admin_register'
          ? '/register/pending'
          : '/booking/cart';
    const origin = typeof webOrigin === 'string' ? webOrigin : undefined;
    return {
      scope: ['profile', 'email'],
      state: encodeOAuthState(nextPath, origin, oauthContext),
    };
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      query?: { error?: string; state?: string; next?: string };
    }>();
    const oauthError = request.query?.error;
    if (typeof oauthError === 'string' && oauthError.length > 0) {
      this.redirectOAuthFailure(
        context,
        oauthError === 'access_denied' ? 'google_auth_failed' : 'google_auth_error',
      );
      return false;
    }

    try {
      const result = await super.canActivate(context);
      return this.isAllowedGuardResult(result);
    } catch {
      this.redirectOAuthFailure(context);
      return false;
    }
  }

  override handleRequest<TUser>(
    err: unknown,
    user: TUser,
    _info: unknown,
    _context: ExecutionContext,
  ): TUser {
    if (err) {
      throw err;
    }
    if (!user) {
      throw new UnauthorizedException('Google authentication failed');
    }
    return user;
  }

  /** Nest only blocks the route when the guard returns `false`, not `null`. */
  private isAllowedGuardResult(result: boolean | unknown): boolean {
    if (result === false || result == null) {
      return false;
    }
    return true;
  }

  private redirectOAuthFailure(
    context: ExecutionContext,
    code = 'google_auth_failed',
  ): void {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<{
      query?: { state?: string; next?: string };
    }>();
    const rawState =
      typeof request.query?.state === 'string'
        ? request.query.state
        : typeof request.query?.next === 'string'
          ? request.query.next
          : undefined;
    const { next, webOrigin, context: oauthContext } = decodeOAuthState(rawState);

    safeOAuthRedirect(
      response,
      this.authService.buildOAuthErrorUrl(next, code, webOrigin, oauthContext),
    );
  }
}
