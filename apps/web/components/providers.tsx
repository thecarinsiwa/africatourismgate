'use client';

import type { ReactNode } from 'react';
import { ToastProvider } from '@africatourismgate/ui';
import { GlobalBookingChatFab } from './account/global-booking-chat-fab';
import { LocaleProvider } from '../lib/i18n/locale-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <ToastProvider>
        {children}
        <GlobalBookingChatFab />
      </ToastProvider>
    </LocaleProvider>
  );
}
