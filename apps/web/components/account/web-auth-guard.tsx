'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { WebSessionIdleLock } from '../auth/web-session-idle-lock';
import {
  ensureClientAccessToken,
  getWebSession,
  hasWebSession,
} from '../../lib/auth/client-session';
import { useBrowserSessionLifecycle } from '../../lib/auth/browser-lifecycle';
import {
  isIdleExpired,
  isSessionLocked,
  setSessionLocked,
} from '../../lib/auth/session-idle';

type Props = {
  children: ReactNode;
  currentPathWithQuery: string;
};

export function WebAuthGuard({ children, currentPathWithQuery }: Props) {
  const router = useRouter();
  const t = useTranslations('booking.sessionLock');
  const [ready, setReady] = useState(false);
  useBrowserSessionLifecycle();

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      if (!hasWebSession()) {
        const next = encodeURIComponent(currentPathWithQuery);
        router.replace(`/booking/login?next=${next}`);
        return;
      }

      if (isSessionLocked() || isIdleExpired()) {
        setSessionLocked(true);
        if (mounted) {
          setReady(true);
        }
        return;
      }

      const token = await ensureClientAccessToken();
      if (!mounted) {
        return;
      }

      if (!token && !isSessionLocked() && getWebSession()?.refreshToken) {
        const next = encodeURIComponent(currentPathWithQuery);
        router.replace(`/booking/login?next=${next}`);
        return;
      }

      if (!token && !getWebSession()?.refreshToken) {
        const next = encodeURIComponent(currentPathWithQuery);
        router.replace(`/booking/login?next=${next}`);
        return;
      }

      setReady(true);
    }

    void verifySession();

    return () => {
      mounted = false;
    };
  }, [currentPathWithQuery, router]);

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm text-atg-muted">{t('checkingSession')}</p>
      </div>
    );
  }

  return (
    <>
      {children}
      <WebSessionIdleLock />
    </>
  );
}
