'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getApiBaseUrl } from '../../lib/api/auth';
import {
  isConnectionLocked,
  lockConnection,
  subscribeConnectionLock,
  unlockConnection,
} from '../../lib/api/connection-lock';

type ConnectionLockContextValue = {
  locked: boolean;
  lock: () => void;
  unlock: () => void;
};

const ConnectionLockContext = createContext<ConnectionLockContextValue | null>(
  null,
);

export function useConnectionLock(): ConnectionLockContextValue {
  const ctx = useContext(ConnectionLockContext);
  if (!ctx) {
    throw new Error('useConnectionLock must be used within ConnectionLockProvider');
  }
  return ctx;
}

function ConnectionLockOverlay({ locked }: { locked: boolean }) {
  const t = useTranslations('connectionLock');
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locked) {
      setRetrying(false);
      setError(null);
    }
  }, [locked]);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/health`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) {
        setError(t('retryFailed'));
        return;
      }
      unlockConnection();
      window.location.reload();
    } catch {
      setError(t('retryFailed'));
    } finally {
      setRetrying(false);
    }
  }, [t]);

  if (!locked) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-atg-surface/95 p-4 backdrop-blur-sm dark:bg-atg-surface/95"
      role="dialog"
      aria-modal="true"
      aria-labelledby="web-connection-lock-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-lg dark:border-atg-border dark:bg-atg-elevated">
        <h1
          id="web-connection-lock-title"
          className="text-xl font-bold text-atg-fg"
        >
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-atg-muted">{t('subtitle')}</p>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6">
          <Button
            type="button"
            variant="primary"
            fullWidth
            disabled={retrying}
            loading={retrying}
            loadingText={t('retrying')}
            onClick={() => void handleRetry()}
          >
            {t('retry')}
          </Button>
        </div>

        <p className="mt-4 text-xs text-atg-muted">{t('hint')}</p>
      </div>
    </div>
  );
}

export function ConnectionLockProvider({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState(isConnectionLocked);

  useEffect(() => subscribeConnectionLock(setLocked), []);

  const lock = useCallback(() => {
    lockConnection();
  }, []);

  const unlock = useCallback(() => {
    unlockConnection();
  }, []);

  const value = useMemo(
    () => ({ locked, lock, unlock }),
    [locked, lock, unlock],
  );

  return (
    <ConnectionLockContext.Provider value={value}>
      {children}
      <ConnectionLockOverlay locked={locked} />
    </ConnectionLockContext.Provider>
  );
}
