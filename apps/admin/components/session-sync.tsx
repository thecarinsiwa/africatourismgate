'use client';

import { useEffect } from 'react';
import { getSessionFromDocumentCookies } from '../lib/auth/cookies';
import { getSession, saveSession } from '../lib/auth/session';

/**
 * Realigns localStorage/sessionStorage when middleware refreshed tokens in cookies only.
 */
export function SessionSync() {
  useEffect(() => {
    const fromCookies = getSessionFromDocumentCookies();
    if (!fromCookies) return;

    const stored = getSession();
    if (
      !stored ||
      stored.accessToken !== fromCookies.accessToken ||
      stored.expiresAt !== fromCookies.expiresAt
    ) {
      const remember =
        typeof document !== 'undefined' &&
        document.cookie.includes('atg.admin.remember=1');
      saveSession(fromCookies, remember);
    }
  }, []);

  return null;
}
