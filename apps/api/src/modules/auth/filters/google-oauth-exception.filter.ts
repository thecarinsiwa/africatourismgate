import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../auth.service';

@Catch()
export class GoogleOAuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GoogleOAuthExceptionFilter.name);

  constructor(private readonly authService: AuthService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (res.headersSent) {
      return;
    }

    const path = req.path ?? req.url ?? '';
    if (!path.includes('/auth/google')) {
      if (exception instanceof HttpException) {
        throw exception;
      }
      throw exception;
    }

    const state =
      typeof req.query?.state === 'string'
        ? req.query.state
        : typeof req.query?.next === 'string'
          ? req.query.next
          : undefined;

    const googleError =
      typeof req.query?.error === 'string' ? req.query.error : undefined;

    let code = 'google_auth_failed';
    if (googleError === 'access_denied') {
      code = 'google_auth_cancelled';
    } else if (exception instanceof UnauthorizedException) {
      code = 'google_auth_failed';
    } else if (exception instanceof HttpException) {
      code = 'google_auth_error';
    }

    const detail =
      exception instanceof Error
        ? exception.message
        : typeof exception === 'string'
          ? exception
          : 'unknown error';
    this.logger.warn(
      `Google OAuth error (code=${code}, googleError=${googleError ?? 'none'}): ${detail}`,
    );

    res.redirect(this.authService.buildWebOAuthErrorUrl(state, code));
  }
}
