'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getOrCreateVisitorId } from '../../lib/analytics/visitor-id';
import { trackPageViewBeacon } from '../../lib/api/public-analytics';
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  hasAnalyticsConsent,
} from '../../lib/cookies/consent';

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

function sendPageView(pathname: string, locale: string): void {
  if (!hasAnalyticsConsent()) {
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
}

/**
 * Records an anonymous page view on each client-side navigation,
 * only when analytics cookies have been accepted.
 */
export function PageviewBeacon() {
  const pathname = usePathname();
  const locale = useLocale();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    function syncConsent() {
      setAnalyticsAllowed(hasAnalyticsConsent());
    }
    syncConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
    window.addEventListener('storage', syncConsent);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
      window.removeEventListener('storage', syncConsent);
    };
  }, []);

  useEffect(() => {
    if (!pathname || !analyticsAllowed) {
      return;
    }
    sendPageView(pathname, locale);
  }, [pathname, locale, analyticsAllowed]);

  return null;
}
