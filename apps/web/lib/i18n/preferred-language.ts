import type { AuthUser } from '@africatourismgate/types';
import { getAccountApiClient } from '../api/account';
import { getWebSession, saveWebSession } from '../auth/client-session';
import { DEFAULT_LOCALE, isLocale, LOCALE_STORAGE_KEY, type Locale } from './types';

export function localeFromPreferredLanguage(
  value: string | null | undefined,
): Locale | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isLocale(normalized) ? normalized : null;
}

/** Locale for first paint: logged-in user preference, then localStorage, then default. */
export function resolveInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const session = getWebSession();
  const fromUser = localeFromPreferredLanguage(session?.user?.preferredLanguage);
  if (fromUser) return fromUser;

  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isLocale(stored)) return stored;
  } catch {
    /* ignore */
  }

  return DEFAULT_LOCALE;
}

export async function persistPreferredLanguage(locale: Locale): Promise<void> {
  const session = getWebSession();
  if (!session?.user) return;
  if (localeFromPreferredLanguage(session.user.preferredLanguage) === locale) return;

  try {
    const client = await getAccountApiClient();
    const updated = await client.updateAuthProfile({ preferredLanguage: locale });
    saveWebSession({ ...session, user: updated });
  } catch {
    /* UI locale still applied via LocaleProvider */
  }
}

export function syncSessionUserPreferredLanguage(user: AuthUser): void {
  const session = getWebSession();
  if (!session) return;
  saveWebSession({ ...session, user });
}
