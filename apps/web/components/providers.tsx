'use client';

import type { ReactNode } from 'react';
import { ToastProvider } from '@africatourismgate/ui';
import { GlobalBookingChatFab } from './account/global-booking-chat-fab';
import { LocaleBootstrap } from '../lib/i18n/locale-bootstrap';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleBootstrap>
      <ToastProvider>
        {children}
        <GlobalBookingChatFab />
      </ToastProvider>
    </LocaleBootstrap>
  );
}
