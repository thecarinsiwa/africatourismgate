'use client';

import { useEffect } from 'react';
import { getApiBaseUrl } from '../api/auth';
import { clearWebAuthState, getWebSession } from './client-session';

function revokeSessionOnUnload(): void {
  const session = getWebSession();
  const refreshToken = session?.refreshToken;
  if (!refreshToken || typeof navigator === 'undefined' || !navigator.sendBeacon) {
    return;
  }

  const url = `${getApiBaseUrl()}/auth/logout`;
  const blob = new Blob([JSON.stringify({ refreshToken })], {
    type: 'application/json',
  });
  navigator.sendBeacon(url, blob);
  // Drop local tokens immediately so a refresh cannot keep a zombie session
  // that would spam POST /auth/touch with 401.
  clearWebAuthState();
}

/** Revoke refresh token when the browser tab/window is actually unloaded. */
export function useBrowserSessionLifecycle(): void {
  useEffect(() => {
    function onPageHide(event: PageTransitionEvent) {
      if (event.persisted) {
        return;
      }
      revokeSessionOnUnload();
    }

    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, []);
}
