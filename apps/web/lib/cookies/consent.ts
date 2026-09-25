export const COOKIE_CONSENT_STORAGE_KEY = 'atg.cookie.consent';
export const COOKIE_CONSENT_CHANGED_EVENT = 'atg:cookie-consent-changed';

export const COOKIE_CONSENT_VERSION = 1 as const;

export type CookieConsentPreferences = {
  version: typeof COOKIE_CONSENT_VERSION;
  /** Always required — locale, session, security. */
  necessary: true;
  /** Anonymous site analytics (`atg-vid` + page views). */
  analytics: boolean;
  decidedAt: string;
};

function isConsentShape(value: unknown): value is CookieConsentPreferences {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    row.version === COOKIE_CONSENT_VERSION &&
    row.necessary === true &&
    typeof row.analytics === 'boolean' &&
    typeof row.decidedAt === 'string'
  );
}

export function getCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isConsentShape(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function hasCookieConsentDecision(): boolean {
  return getCookieConsent() != null;
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent()?.analytics === true;
}

export function setCookieConsent(analytics: boolean): CookieConsentPreferences {
  const preferences: CookieConsentPreferences = {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    analytics,
    decidedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        COOKIE_CONSENT_STORAGE_KEY,
        JSON.stringify(preferences),
      );
    } catch {
      /* private mode / quota — still notify listeners for this session */
    }
    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: preferences }),
    );
  }

  return preferences;
}
