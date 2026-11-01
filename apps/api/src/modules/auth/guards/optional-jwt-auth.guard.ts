import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Runs JWT validation only when an Authorization Bearer token is present.
 * Missing/invalid tokens do not fail the request — request.user stays unset.
 * Use with @Public() routes that optionally personalize for logged-in users.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers?: { authorization?: string };
    }>();
    const header = request.headers?.authorization;
    if (!header?.startsWith('Bearer ')) {
      return true;
    }
    try {
      const ok = await super.canActivate(context);
      return ok as boolean;
    } catch {
      return true;
    }
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser | null {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
