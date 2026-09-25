'use client';

import {
  ConnectionLockProvider as SharedConnectionLockProvider,
  type ConnectionLockMessages,
} from '@africatourismgate/ui';
import type { ReactNode } from 'react';
import { resolveApiBaseUrl } from '../lib/auth/api';

const CONNECTION_LOCK_FR: ConnectionLockMessages = {
  title: 'Connexion interrompue',
  subtitle: 'Impossible de joindre l’API. Vérifiez votre connexion réseau.',
  hint: 'Si vous êtes en développement, assurez-vous que l’API est démarrée sur le port configuré.',
  retry: 'Réessayer',
  retrying: 'Vérification…',
  retryFailed: 'L’API est toujours injoignable. Réessayez dans un instant.',
};

const OFFLINE_LOCK_FR: ConnectionLockMessages = {
  title: 'Vous êtes hors ligne',
  subtitle: 'Aucune connexion Internet détectée. La caisse ne peut pas se charger.',
  hint: 'Vérifiez le Wi‑Fi ou les données mobiles, puis réessayez.',
  retry: 'Réessayer',
  retrying: 'Vérification…',
  retryFailed: 'Vous êtes toujours hors ligne. Réessayez lorsque la connexion revient.',
};

export function PosConnectionLockProvider({ children }: { children: ReactNode }) {
  const healthUrl = `${resolveApiBaseUrl()}/health`;

  return (
    <SharedConnectionLockProvider
      connectionLock={CONNECTION_LOCK_FR}
      offlineLock={OFFLINE_LOCK_FR}
      healthUrl={healthUrl}
    >
      {children}
    </SharedConnectionLockProvider>
  );
}
