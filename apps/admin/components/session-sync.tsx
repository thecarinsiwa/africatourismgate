'use client';

import { useEffect } from 'react';
import { ensureFreshSession } from '../lib/auth/api';
import {
  getRememberFromDocumentCookies,
  getSessionFromDocumentCookies,
} from '../lib/auth/cookies';
import { getSession, saveSession } from '../lib/auth/session';

/**
 * Realigns localStorage/sessionStorage when middleware refreshed tokens in cookies only.
 */
export function SessionSync() {
  useEffect(() => {
    function syncFromCookies() {
      const fromCookies = getSessionFromDocumentCookies();
      if (!fromCookies) return;

      const stored = getSession();
      if (
        !stored ||
        stored.accessToken !== fromCookies.accessToken ||
        stored.expiresAt !== fromCookies.expiresAt
      ) {
        saveSession(fromCookies, getRememberFromDocumentCookies());
      }
    }

    syncFromCookies();
    void ensureFreshSession();

    const onFocus = () => {
      syncFromCookies();
      void ensureFreshSession();
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return null;
}
