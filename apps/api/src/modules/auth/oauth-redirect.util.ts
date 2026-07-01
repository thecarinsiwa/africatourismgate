import type { Response } from 'express';

/** Avoid ERR_HTTP_HEADERS_SENT when OAuth guard and controller both handle a response. */
export function safeOAuthRedirect(res: Response, url: string): boolean {
  if (res.headersSent) {
    return false;
  }
  res.redirect(url);
  return true;
}
