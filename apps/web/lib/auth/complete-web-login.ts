import type { AuthUser } from '@africatourismgate/types';

type RouterLike = { replace: (href: string) => void };
import { localeFromPreferredLanguage } from '../i18n/preferred-language';
import { LOCALE_STORAGE_KEY } from '../i18n/types';
import { authResponseToWebSession, saveWebSession, type WebStoredSession } from './client-session';

export function applyUserPreferredLocale(user: AuthUser | null | undefined): void {
  const locale = localeFromPreferredLanguage(user?.preferredLanguage);
  if (!locale) return;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  } catch {
    /* ignore */
  }
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
