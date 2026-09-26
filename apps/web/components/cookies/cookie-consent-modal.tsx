'use client';

import Link from 'next/link';
import { useCallback, useId, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Button } from '@africatourismgate/ui';
import { clearVisitorId } from '../../lib/analytics/visitor-id';
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  getCookieConsent,
  setCookieConsent,
} from '../../lib/cookies/consent';
import { LEGAL_PATHS } from '../../lib/legal/routes';

function subscribeToConsent(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === COOKIE_CONSENT_STORAGE_KEY || event.key === null) {
      onStoreChange();
    }
  };
  window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onStoreChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onStoreChange);
    window.removeEventListener('storage', onStorage);
  };
}

function getNeedsConsentSnapshot(): boolean {
  return getCookieConsent() == null;
}

function getServerConsentSnapshot(): boolean {
  return false;
}

export function CookieConsentModal() {
  const t = useTranslations('cookieConsent');
  const titleId = useId();
  const descriptionId = useId();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const needsConsent = useSyncExternalStore(
    subscribeToConsent,
    getNeedsConsentSnapshot,
    getServerConsentSnapshot,
  );

  const persist = useCallback((analytics: boolean) => {
    setCookieConsent(analytics);
    if (!analytics) {
      clearVisitorId();
    }
  }, []);

  if (!needsConsent || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center overflow-y-auto overscroll-contain p-4 sm:items-center"
      role="presentation"
    >
      <div className="fixed inset-0 bg-black/55 dark:bg-black/70" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 my-auto w-full max-w-md rounded-xl border border-atg-border bg-atg-elevated p-6 shadow-2xl shadow-black/20 dark:shadow-black/50"
      >
        <h2 id={titleId} className="text-lg font-semibold text-atg-fg">
          {t('title')}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-atg-muted">
          {t('description')}
        </p>

        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-atg-border bg-atg-surface/60 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-atg-fg">
                  {t('necessary.title')}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-atg-muted">
                  {t('necessary.description')}
                </p>
              </div>
              <span className="shrink-0 rounded bg-atg-border/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-atg-muted">
                {t('necessary.alwaysOn')}
              </span>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-atg-border bg-atg-surface/60 p-3 transition-colors hover:border-primary/40">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 rounded border-atg-border text-primary focus:ring-primary"
              checked={analyticsEnabled}
              onChange={(event) => setAnalyticsEnabled(event.target.checked)}
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-atg-fg">
                {t('analytics.title')}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-atg-muted">
                {t('analytics.description')}
              </span>
            </span>
          </label>

          <p className="text-xs text-atg-muted">
            <Link
              href={LEGAL_PATHS.privacyPolicy}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {t('privacyLink')}
            </Link>
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="primary"
              className="w-full sm:w-auto sm:flex-1"
              onClick={() => persist(true)}
            >
              {t('acceptAll')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto sm:flex-1"
              onClick={() => persist(false)}
            >
              {t('rejectOptional')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto sm:flex-1"
              onClick={() => persist(analyticsEnabled)}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
