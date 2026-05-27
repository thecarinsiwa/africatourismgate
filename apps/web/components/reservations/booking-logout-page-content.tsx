'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { logoutAuth } from '../../lib/api/auth';
import { clearWebSession, getWebSession } from '../../lib/auth/client-session';

export function BookingLogoutPageContent() {
  const router = useRouter();

  useEffect(() => {
    const session = getWebSession();
    clearWebSession();
    if (session?.refreshToken) {
      void logoutAuth(session.refreshToken).catch(() => undefined);
    }
    router.replace('/booking/login');
  }, [router]);

  return null;
}
