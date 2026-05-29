'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { logoutAuth } from '../../lib/api/auth';
import { clearWebAuthState, getWebSession } from '../../lib/auth/client-session';

export function BookingLogoutPageContent() {
  const router = useRouter();

  useEffect(() => {
    const session = getWebSession();
    const refreshToken = session?.refreshToken;
    clearWebAuthState();
    if (refreshToken) {
      void logoutAuth(refreshToken).catch(() => undefined);
    }
    router.replace('/booking/login');
  }, [router]);

  return null;
}
