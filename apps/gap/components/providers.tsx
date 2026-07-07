'use client';

import type { ReactNode } from 'react';
import { ToastProvider } from '@africatourismgate/ui';

export function Providers({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
