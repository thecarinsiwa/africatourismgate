'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { getOrCreateVisitorId } from '../../lib/analytics/visitor-id';
import { trackPageViewBeacon } from '../../lib/api/public-analytics';

/** Suppress React Strict Mode double-invoke for the same path within a short window. */
const DEDUPE_MS = 1500;

let lastSentKey: string | null = null;
let lastSentAt = 0;

function normalizePath(pathname: string): string | null {
  const path = pathname.split(/[?#]/)[0] ?? '';
  if (!path.startsWith('/') || path.length > 512) {
    return null;
  }
  return path;
}

/**
 * Records an anonymous page view on each client-side navigation.
 */
export function PageviewBeacon() {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const path = normalizePath(pathname);
    if (!path) {
      return;
    }

    const key = `${locale}:${path}`;
    const now = Date.now();
    if (lastSentKey === key && now - lastSentAt < DEDUPE_MS) {
      return;
    }
    lastSentKey = key;
    lastSentAt = now;

    const visitorId = getOrCreateVisitorId();
    if (!visitorId) {
      return;
    }

    trackPageViewBeacon({ visitorId, path, locale });
  }, [pathname, locale]);

  return null;
}
