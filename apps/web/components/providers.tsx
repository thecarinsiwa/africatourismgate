'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ToastProvider } from '@africatourismgate/ui';
import { GlobalBookingChatFab } from './account/global-booking-chat-fab';
import { PageviewBeacon } from './analytics/pageview-beacon';
import { ConnectionLockProvider } from './connection-lock/connection-lock-provider';
import { CookieConsentModal } from './cookies/cookie-consent-modal';
import { LocaleBootstrap } from '../lib/i18n/locale-bootstrap';

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideBookingChat = pathname === '/maintenance' || pathname?.startsWith('/maintenance/');

  return (
    <LocaleBootstrap>
      <ToastProvider>
        <ConnectionLockProvider>
          <PageviewBeacon />
          <CookieConsentModal />
          {children}
          {hideBookingChat ? null : <GlobalBookingChatFab />}
        </ConnectionLockProvider>
      </ToastProvider>
    </LocaleBootstrap>
  );
}
