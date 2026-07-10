import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

export type GoogleOAuthErrorCode =
  | 'google_auth_failed'
  | 'google_auth_error'
  | 'google_no_email'
  | 'google_account_inactive'
  | 'google_signup_unavailable'
  | 'gmail_only'
  | 'account_exists';

export function extractGoogleProfileEmail(profile: {
  emails?: Array<{ value?: string }>;
  _json?: { email?: string };
}): string | undefined {
  const fromEmails = profile.emails
    ?.map((entry) => entry.value?.trim())
    .find((value) => Boolean(value));
  if (fromEmails) {
    return fromEmails.toLowerCase();
  }

  const fromJson = profile._json?.email?.trim();
  if (fromJson) {
    return fromJson.toLowerCase();
  }

  return undefined;
}

export function resolveGoogleOAuthErrorCode(err: unknown): GoogleOAuthErrorCode {
  if (err instanceof BadRequestException) {
    const message = err.message.toLowerCase();
    if (message.includes('gmail')) {
      return 'gmail_only';
    }
  }

  if (err instanceof ConflictException) {
    return 'account_exists';
  }

  if (err instanceof UnauthorizedException) {
    const message = err.message.toLowerCase();
    if (message.includes('no email')) {
      return 'google_no_email';
    }
    if (message.includes('not active')) {
      return 'google_account_inactive';
    }
    return 'google_auth_failed';
  }

  if (err instanceof InternalServerErrorException) {
    return 'google_signup_unavailable';
  }

  if (err instanceof HttpException && err.getStatus() >= 500) {
    return 'google_signup_unavailable';
  }

  return 'google_auth_error';
}
