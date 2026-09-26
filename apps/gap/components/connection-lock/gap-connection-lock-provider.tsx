'use client';

import {
  ConnectionLockProvider as SharedConnectionLockProvider,
  type ConnectionLockMessages,
} from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useMemo, type ReactNode } from 'react';
import { getPublicApiBaseUrl } from '../../lib/api/api-base-url';

function useLockMessages(
  namespace: 'connectionLock' | 'offlineLock',
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

export function GapConnectionLockProvider({ children }: { children: ReactNode }) {
  const connectionLock = useLockMessages('connectionLock');
  const offlineLock = useLockMessages('offlineLock');
  const healthUrl = `${getPublicApiBaseUrl()}/health`;

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
