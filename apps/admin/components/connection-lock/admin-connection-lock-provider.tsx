'use client';

import {
  ConnectionLockProvider as SharedConnectionLockProvider,
  type ConnectionLockMessages,
} from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useMemo, type ReactNode } from 'react';
import { resolveApiBaseUrl } from '../lib/auth/api-url';

function useLockMessages(
  namespace: 'common.connectionLock' | 'common.offlineLock',
): ConnectionLockMessages {
  const t = useTranslations(namespace);
  return useMemo(
    () => ({
      title: t('title'),
      subtitle: t('subtitle'),
      hint: t('hint'),
      retry: t('retry'),
      retrying: t('retrying'),
      retryFailed: t('retryFailed'),
    }),
    [t],
  );
}

export function AdminConnectionLockProvider({ children }: { children: ReactNode }) {
  const connectionLock = useLockMessages('common.connectionLock');
  const offlineLock = useLockMessages('common.offlineLock');
  const healthUrl = `${resolveApiBaseUrl()}/health`;

  return (
    <SharedConnectionLockProvider
      connectionLock={connectionLock}
      offlineLock={offlineLock}
      healthUrl={healthUrl}
    >
      {children}
    </SharedConnectionLockProvider>
  );
}
