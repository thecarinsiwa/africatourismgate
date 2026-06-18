import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  override getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ query?: { next?: string } }>();
    const next = request.query?.next;
    return {
      scope: ['profile', 'email'],
      state: typeof next === 'string' ? next : '/booking/cart',
    };
  }
}
