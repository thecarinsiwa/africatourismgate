'use client';

import type { ReactNode } from 'react';
import { ThemeProvider, ToastProvider } from '@africatourismgate/ui';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="atg-theme">
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
