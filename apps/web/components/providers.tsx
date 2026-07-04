'use client';

import type { ReactNode } from 'react';
import { ToastProvider } from '@africatourismgate/ui';
import { LocaleProvider } from '../lib/i18n/locale-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <ToastProvider>{children}</ToastProvider>
    </LocaleProvider>
  );
}
