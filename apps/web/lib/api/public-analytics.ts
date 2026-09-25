import type { TrackPageViewRequest } from '@africatourismgate/types';
import { getApiBaseUrl } from './auth';

/**
 * Fire-and-forget page view to the public analytics beacon.
 * Prefer `sendBeacon`; fall back to `fetch` with `keepalive`.
 */
export function trackPageViewBeacon(payload: TrackPageViewRequest): void {
  const url = `${getApiBaseUrl()}/public/analytics/page-views`;
  const body = JSON.stringify(payload);

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon(url, blob)) {
        return;
      }
    }

    void fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
      credentials: 'omit',
    }).catch(() => {
      /* ignore network errors — analytics must not affect UX */
    });
  } catch {
    /* ignore */
  }
}
