import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { resolveGoogleOAuthErrorCode } from '../google-profile.utils';
import { decodeOAuthState } from '../oauth-state.util';
import { safeOAuthRedirect } from '../oauth-redirect.util';

@Catch(HttpException)
export class GoogleOAuthExceptionFilter implements ExceptionFilter {
  constructor(private readonly authService: AuthService) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (res.headersSent) {
      return;
    }

    const path = req.path ?? req.url ?? '';
    if (!path.includes('/auth/google')) {
      throw exception;
    }

    const rawState =
      typeof req.query?.state === 'string'
        ? req.query.state
        : typeof req.query?.next === 'string'
          ? req.query.next
          : undefined;
    const { next, webOrigin } = decodeOAuthState(rawState);

    safeOAuthRedirect(
      res,
      this.authService.buildWebOAuthErrorUrl(
        next,
        resolveGoogleOAuthErrorCode(exception),
        webOrigin,
      ),
    );
  }
}
