'use client';

import { useEffect } from 'react';
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
  }, []);

  return null;
}
