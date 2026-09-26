'use client';

import type { ReactNode } from 'react';
import { ThemeProvider, ToastProvider } from '@africatourismgate/ui';
import { GapConnectionLockProvider } from './connection-lock/gap-connection-lock-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="atg-theme">
      <ToastProvider>
        <GapConnectionLockProvider>{children}</GapConnectionLockProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
