import type { BrowserContext, Page } from '@playwright/test';

/** Matches `COOKIE_CONSENT_STORAGE_KEY` / `COOKIE_CONSENT_VERSION` in lib/cookies/consent.ts */
export const E2E_COOKIE_CONSENT_KEY = 'atg.cookie.consent';

export const E2E_COOKIE_CONSENT_VALUE = JSON.stringify({
  version: 1,
  necessary: true,
  analytics: false,
  decidedAt: '2026-01-01T00:00:00.000Z',
});

/** Matches `E2E_DISABLE_CONNECTION_LOCK_KEY` in `@africatourismgate/ui` connection-lock store. */
export const E2E_DISABLE_CONNECTION_LOCK_KEY = 'atg.e2e.disableConnectionLock';

/** Playwright storageState snippet so the cookie modal never blocks e2e clicks. */
export function cookieConsentStorageOrigin(origin: string) {
  return {
    origin: origin.replace(/\/$/, ''),
    localStorage: [
      {
        name: E2E_COOKIE_CONSENT_KEY,
        value: E2E_COOKIE_CONSENT_VALUE,
      },
      {
        name: E2E_DISABLE_CONNECTION_LOCK_KEY,
        value: '1',
      },
    ],
  };
}

export function cookieConsentStorageState(origin: string) {
  return {
    cookies: [] as [],
    origins: [cookieConsentStorageOrigin(origin)],
  };
}

/** Use when a test overrides storageState / clears localStorage. */
export async function seedCookieConsent(
  target: Page | BrowserContext,
): Promise<void> {
  await target.addInitScript(
    ({ consentKey, consentValue, lockKey }) => {
      try {
        window.localStorage.setItem(consentKey, consentValue);
        window.localStorage.setItem(lockKey, '1');
      } catch {
        /* ignore */
      }
    },
    {
      consentKey: E2E_COOKIE_CONSENT_KEY,
      consentValue: E2E_COOKIE_CONSENT_VALUE,
      lockKey: E2E_DISABLE_CONNECTION_LOCK_KEY,
    },
  );
}
