'use client';

import { ApiHttpError } from '@africatourismgate/api-client';
import { Button, PasswordInput } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiClient } from '../lib/auth/api';
import { logout } from '../lib/auth/logout';
import {
  isIdleExpired,
  isSessionLocked,
  markActivity,
  SESSION_IDLE_LOCK_MS,
  SESSION_LOCK_CHANGED_EVENT,
  SESSION_TOUCH_DEBOUNCE_MS,
  setSessionLocked,
} from '../lib/auth/session-idle';
import {
  AUTH_CHANGED_EVENT,
  getSession,
  saveSession,
  tokensToStoredSession,
} from '../lib/auth/session';

const IDLE_CHECK_INTERVAL_MS = 30_000;

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'click',
  'scroll',
  'touchstart',
] as const;

function isUnlockPasswordError(error: unknown): boolean {
  if (!(error instanceof ApiHttpError) || error.status !== 401) {
    return false;
  }
  const message =
    typeof error.message === 'string' ? error.message.toLowerCase() : '';
  return message.includes('password');
}

export function SessionIdleLock() {
  const router = useRouter();
  const t = useTranslations('auth.sessionLock');
  const [locked, setLocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const lastTouchAtRef = useRef(0);
  const touchInFlightRef = useRef(false);

  const syncLockedState = useCallback(() => {
    const shouldLock = isSessionLocked() || isIdleExpired();
    if (shouldLock && getSession()?.accessToken) {
      setSessionLocked(true);
    }
    setLocked(shouldLock && Boolean(getSession()?.accessToken));
  }, []);

  const touchServerActivity = useCallback(async () => {
    const session = getSession();
    if (!session?.refreshToken || isSessionLocked()) {
      return;
    }

    const now = Date.now();
    if (now - lastTouchAtRef.current < SESSION_TOUCH_DEBOUNCE_MS) {
      return;
    }
    if (touchInFlightRef.current) {
      return;
    }

    touchInFlightRef.current = true;
    try {
      await getApiClient().touchSession(session.refreshToken);
      lastTouchAtRef.current = Date.now();
    } catch (err) {
      if (err instanceof ApiHttpError) {
        const body = err.body as { code?: string } | undefined;
        if (body?.code === 'SESSION_LOCKED' || isIdleExpired()) {
          setSessionLocked(true);
          setLocked(true);
        }
      }
    } finally {
      touchInFlightRef.current = false;
    }
  }, []);

  const recordActivity = useCallback(() => {
    if (locked || isSessionLocked()) {
      return;
    }

    markActivity();
    void touchServerActivity();
  }, [locked, touchServerActivity]);

  useEffect(() => {
    syncLockedState();

    function onLockChanged() {
      syncLockedState();
    }

    window.addEventListener(SESSION_LOCK_CHANGED_EVENT, onLockChanged);
    window.addEventListener(AUTH_CHANGED_EVENT, syncLockedState);
    return () => {
      window.removeEventListener(SESSION_LOCK_CHANGED_EVENT, onLockChanged);
      window.removeEventListener(AUTH_CHANGED_EVENT, syncLockedState);
    };
  }, [syncLockedState]);

  useEffect(() => {
    if (!getSession()?.accessToken) {
      return;
    }

    recordActivity();

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, recordActivity, { passive: true });
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        if (isIdleExpired()) {
          setSessionLocked(true);
          setLocked(true);
          return;
        }
        recordActivity();
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    const intervalId = window.setInterval(() => {
      if (!getSession()?.accessToken) {
        return;
      }
      if (isIdleExpired()) {
        setSessionLocked(true);
        setLocked(true);
      }
    }, IDLE_CHECK_INTERVAL_MS);

    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, recordActivity);
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [recordActivity]);

  const handleUnlock = useCallback(async () => {
    const session = getSession();
    if (!session?.refreshToken || !password.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const tokens = await getApiClient().unlockSession({
        password,
        refreshToken: session.refreshToken,
      });
      saveSession(tokensToStoredSession(tokens, session.user));
      markActivity();
      setSessionLocked(false);
      setLocked(false);
      setPassword('');
    } catch (err) {
      if (isUnlockPasswordError(err)) {
        setError(t('invalidPassword'));
      } else {
        setError(t('genericError'));
      }
    } finally {
      setSubmitting(false);
    }
  }, [password, t]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
    router.refresh();
  }, [router]);

  if (!locked) {
    return null;
  }

  const session = getSession();
  const email = session?.user.email ?? '';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-atg-surface/95 p-4 backdrop-blur-sm dark:bg-atg-surface/95"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-lock-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-lg dark:border-atg-border dark:bg-atg-elevated">
        <h1 id="session-lock-title" className="text-xl font-bold text-atg-fg">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-atg-muted">{t('subtitle')}</p>
        {email ? (
          <p className="mt-3 text-sm font-medium text-atg-fg">{email}</p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </p>
        ) : null}

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleUnlock();
          }}
        >
          <PasswordInput
            id="session-unlock-password"
            name="password"
            label={t('passwordLabel')}
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            minLength={8}
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={submitting || password.length < 8}
            >
              {submitting ? t('unlockLoading') : t('unlock')}
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth
              disabled={submitting}
              onClick={() => void handleLogout()}
            >
              {t('logout')}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-xs text-atg-muted">
          {t('idleHint', {
            minutes: Math.max(1, Math.round(SESSION_IDLE_LOCK_MS / 60_000)),
          })}
        </p>
      </div>
    </div>
  );
}
