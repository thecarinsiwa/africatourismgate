import type { AuthUser } from '@africatourismgate/types';
import type { AppLocale } from '../../i18n/routing';
import { getSession, saveSession } from '../auth/session';

export function localeFromPreferredLanguage(
  value: string | null | undefined,
): AppLocale | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'fr' || normalized === 'en') return normalized;
  return null;
}

export function applyLocaleFromUser(user: AuthUser | undefined): void {
  const locale = localeFromPreferredLanguage(user?.preferredLanguage);
  if (!locale || typeof document === 'undefined') return;
  document.documentElement.lang = locale;
  try {
    localStorage.setItem('atg-locale', locale);
  } catch {
    /* ignore */
  }
}

export function syncSessionUserPreferredLanguage(user: AuthUser): void {
  const session = getSession();
  if (!session) return;
  saveSession({ ...session, user });
}
