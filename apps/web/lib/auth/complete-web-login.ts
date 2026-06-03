import type { AuthUser } from '@africatourismgate/types';

type RouterLike = { replace: (href: string) => void };
import {
  applyLocaleToDocument,
  localeFromPreferredLanguage,
} from '../i18n/preferred-language';
import { authResponseToWebSession, saveWebSession, type WebStoredSession } from './client-session';

export function applyUserPreferredLocale(user: AuthUser | null | undefined): void {
  const locale = localeFromPreferredLanguage(user?.preferredLanguage);
  if (!locale) return;
  applyLocaleToDocument(locale);
}

export function completeWebLogin(
  session: WebStoredSession,
  router: RouterLike,
  nextPath: string,
): void {
  saveWebSession(session, false);
  applyUserPreferredLocale(session.user);
  router.replace(nextPath);
}

export function completeWebLoginFromAuthResponse(
  auth: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthUser;
  },
  router: RouterLike,
  nextPath: string,
): void {
  completeWebLogin(authResponseToWebSession(auth), router, nextPath);
}
