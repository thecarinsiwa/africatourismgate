'use client';

import { useEffect } from 'react';

/**
 * Intentionally does not revoke the server session on pagehide.
 *
 * Mobile browsers (and some desktop cases) fire `pagehide` when switching apps
 * or backgrounding the tab — the page can come back with sessionStorage intact.
 * A sendBeacon logout there revoked the refresh token and caused 401 → disconnect
 * on the next navigation.
 *
 * Tab close already drops sessionStorage. Server idle-lock + token expiry handle
 * abandoned sessions. Touch 401 handlers clear local auth if the server session
 * is already gone.
 */
export function useBrowserSessionLifecycle(): void {
  useEffect(() => {
    // Hook kept for future lifecycle needs (analytics, etc.) without logout side effects.
  }, []);
}
