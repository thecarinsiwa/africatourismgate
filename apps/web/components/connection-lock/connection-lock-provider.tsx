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

function LockOverlayCard({
  titleId,
  title,
  subtitle,
  hint,
  retryLabel,
  retryingLabel,
  error,
  retrying,
  onRetry,
  zClassName,
}: {
  titleId: string;
  title: string;
  subtitle: string;
  hint: string;
  retryLabel: string;
  retryingLabel: string;
  error: string | null;
  retrying: boolean;
  onRetry: () => void;
  zClassName: string;
}) {
  return (
    <div
      className={`fixed inset-0 ${zClassName} flex items-center justify-center bg-atg-surface/95 p-4 backdrop-blur-sm dark:bg-atg-surface/95`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="w-full max-w-md rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-lg dark:border-atg-border dark:bg-atg-elevated">
        <h1 id={titleId} className="text-xl font-bold text-atg-fg">
          {title}
        </h1>
        <p className="mt-2 text-sm text-atg-muted">{subtitle}</p>

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
            loadingText={retryingLabel}
            onClick={onRetry}
          >
            {retryLabel}
          </Button>
        </div>

        <p className="mt-4 text-xs text-atg-muted">{hint}</p>
      </div>
    </div>
  );
}

function ConnectionLockOverlay({
  locked,
  suppressed,
}: {
  locked: boolean;
  suppressed: boolean;
}) {
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

  if (!locked || suppressed) {
    return null;
  }

  return (
    <LockOverlayCard
      titleId="web-connection-lock-title"
      title={t('title')}
      subtitle={t('subtitle')}
      hint={t('hint')}
      retryLabel={t('retry')}
      retryingLabel={t('retrying')}
      error={error}
      retrying={retrying}
      onRetry={() => void handleRetry()}
      zClassName="z-[200]"
    />
  );
}

function OfflineLockOverlay({ offline }: { offline: boolean }) {
  const t = useTranslations('offlineLock');
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offline) {
      setRetrying(false);
      setError(null);
    }
  }, [offline]);

  const handleRetry = useCallback(() => {
    setRetrying(true);
    setError(null);
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      window.location.reload();
      return;
    }
    setError(t('retryFailed'));
    setRetrying(false);
  }, [t]);

  if (!offline) {
    return null;
  }

  return (
    <LockOverlayCard
      titleId="web-offline-lock-title"
      title={t('title')}
      subtitle={t('subtitle')}
      hint={t('hint')}
      retryLabel={t('retry')}
      retryingLabel={t('retrying')}
      error={error}
      retrying={retrying}
      onRetry={handleRetry}
      zClassName="z-[210]"
    />
  );
}

export function ConnectionLockProvider({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState(isConnectionLocked);
  const [offline, setOffline] = useState(false);

  useEffect(() => subscribeConnectionLock(setLocked), []);

  useEffect(() => {
    const syncOffline = () => {
      setOffline(typeof navigator !== 'undefined' ? !navigator.onLine : false);
    };
    syncOffline();
    window.addEventListener('online', syncOffline);
    window.addEventListener('offline', syncOffline);
    return () => {
      window.removeEventListener('online', syncOffline);
      window.removeEventListener('offline', syncOffline);
    };
  }, []);

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
      <ConnectionLockOverlay locked={locked} suppressed={offline} />
      <OfflineLockOverlay offline={offline} />
    </ConnectionLockContext.Provider>
  );
}
