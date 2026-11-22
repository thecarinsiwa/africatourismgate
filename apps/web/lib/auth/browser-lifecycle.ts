'use client';

/**
 * Web booking session is stored in `sessionStorage`:
 * - survives F5 / soft navigation in the same tab
 * - is discarded automatically when the tab/window is closed
 *
 * We intentionally do **not** logout or clear tokens on `pagehide`/`unload`:
 * those events also fire on refresh, which previously forced users back to
 * `/booking/login` after every reload.
 */
export function useBrowserSessionLifecycle(): void {
  // No unload revocation - refresh must keep the session.
}
