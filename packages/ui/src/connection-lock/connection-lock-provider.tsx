'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Button } from '../components/button';
import {
  isConnectionLocked,
  isConnectionLockSuppressed,
  lockConnection,
  subscribeConnectionLock,
  unlockConnection,
} from './store';

export type ConnectionLockMessages = {
  title: string;
  subtitle: string;
  hint: string;
  retry: string;
  retrying: string;
  retryFailed: string;
};

export type ConnectionLockProviderProps = {
  children: ReactNode;
  connectionLock: ConnectionLockMessages;
  offlineLock: ConnectionLockMessages;
  /** Absolute URL for GET health probe on retry (e.g. `${apiBase}/health`). */
  healthUrl: string;
};

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
  messages,
  healthUrl,
}: {
  locked: boolean;
  suppressed: boolean;
  messages: ConnectionLockMessages;
  healthUrl: string;
}) {
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
      const res = await fetch(healthUrl, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) {
        setError(messages.retryFailed);
        return;
      }
      unlockConnection();
      window.location.reload();
    } catch {
      setError(messages.retryFailed);
    } finally {
      setRetrying(false);
    }
  }, [healthUrl, messages.retryFailed]);

  if (!locked || suppressed || isConnectionLockSuppressed()) {
    return null;
  }

  return (
    <LockOverlayCard
      titleId="atg-connection-lock-title"
      title={messages.title}
      subtitle={messages.subtitle}
      hint={messages.hint}
      retryLabel={messages.retry}
      retryingLabel={messages.retrying}
      error={error}
      retrying={retrying}
      onRetry={() => void handleRetry()}
      zClassName="z-[200]"
    />
  );
}

function OfflineLockOverlay({
  offline,
  messages,
}: {
  offline: boolean;
  messages: ConnectionLockMessages;
}) {
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
    setError(messages.retryFailed);
    setRetrying(false);
  }, [messages.retryFailed]);

  if (!offline) {
    return null;
  }

  return (
    <LockOverlayCard
      titleId="atg-offline-lock-title"
      title={messages.title}
      subtitle={messages.subtitle}
      hint={messages.hint}
      retryLabel={messages.retry}
      retryingLabel={messages.retrying}
      error={error}
      retrying={retrying}
      onRetry={handleRetry}
      zClassName="z-[210]"
    />
  );
}

export function ConnectionLockProvider({
  children,
  connectionLock,
  offlineLock,
  healthUrl,
}: ConnectionLockProviderProps) {
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
      <ConnectionLockOverlay
        locked={locked}
        suppressed={offline}
        messages={connectionLock}
        healthUrl={healthUrl}
      />
      <OfflineLockOverlay offline={offline} messages={offlineLock} />
    </ConnectionLockContext.Provider>
  );
}
