'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {
  buildDevOAuthReturnUrl,
  isLocalDevOrigin,
  readDevOriginFromOAuthNext,
} from './dev-oauth-return';

/**
 * Production OAuth callbacks land on africatourismgate.org first.
 * Redirect to localhost when `atg_dev_origin` was embedded in `next`.
 */
export function useDevOAuthReturnRedirect(pathname: string): void {
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get('next');
    const devOrigin = readDevOriginFromOAuthNext(next);
    if (!devOrigin || !isLocalDevOrigin(devOrigin)) return;
    if (typeof window === 'undefined') return;
    if (window.location.origin === devOrigin.replace(/\/$/, '')) return;

    const params = new URLSearchParams(searchParams.toString());
    window.location.replace(buildDevOAuthReturnUrl(devOrigin, pathname, params));
  }, [pathname, searchParams]);
}
