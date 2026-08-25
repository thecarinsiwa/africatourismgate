import type { AuthResponse, AuthUser } from '@africatourismgate/types';

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
  saveWebSession(session);
  applyUserPreferredLocale(session.user);
  router.replace(nextPath);
}

function assertCompletedAuthResponse(
  auth: AuthResponse,
): asserts auth is AuthResponse & { user: AuthUser } {
  if (
    auth.requiresVerification ||
    !auth.user ||
    !auth.accessToken ||
    !auth.refreshToken
  ) {
    throw new Error('Réponse de connexion invalide.');
  }
}

export function completeWebLoginFromAuthResponse(
  auth: AuthResponse,
  router: RouterLike,
  nextPath: string,
): void {
  assertCompletedAuthResponse(auth);
  completeWebLogin(authResponseToWebSession(auth), router, nextPath);
}
