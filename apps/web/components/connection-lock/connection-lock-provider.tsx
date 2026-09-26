'use client';

import {
  ConnectionLockProvider as SharedConnectionLockProvider,
  type ConnectionLockMessages,
} from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useMemo, type ReactNode } from 'react';
import { getApiBaseUrl } from '../../lib/api/auth';

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

/** Web wrapper : i18n next-intl + health URL autour du provider partagé. */
export function ConnectionLockProvider({ children }: { children: ReactNode }) {
  const connectionLock = useLockMessages('connectionLock');
  const offlineLock = useLockMessages('offlineLock');
  const healthUrl = `${getApiBaseUrl()}/health`;

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
