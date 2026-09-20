import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BookingAuthGuard } from './booking-auth-guard';
import { createRouterMock, rtlTestMessages } from '../../test/rtl-helpers';

const router = createRouterMock();

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/booking/cart',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('../../lib/auth/client-session', () => ({
  hasWebSession: vi.fn(),
  getWebSession: vi.fn(),
  ensureClientAccessToken: vi.fn(),
}));

vi.mock('../../lib/auth/session-idle', () => ({
  isIdleExpired: vi.fn(() => false),
  isSessionLocked: vi.fn(() => false),
  setSessionLocked: vi.fn(),
}));

vi.mock('../../lib/auth/browser-lifecycle', () => ({
  useBrowserSessionLifecycle: vi.fn(),
}));

vi.mock('../auth/web-session-idle-lock', () => ({
  WebSessionIdleLock: () => null,
}));

import {
  ensureClientAccessToken,
  getWebSession,
  hasWebSession,
} from '../../lib/auth/client-session';

function renderGuard(path = '/booking/cart') {
  return render(
    <NextIntlClientProvider locale="en" messages={rtlTestMessages}>
      <BookingAuthGuard currentPathWithQuery={path}>
        <p>Protected checkout</p>
      </BookingAuthGuard>
    </NextIntlClientProvider>,
  );
}

describe('BookingAuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login when there is no session', async () => {
    vi.mocked(hasWebSession).mockReturnValue(false);

    renderGuard('/booking/recap?kind=vehicle');

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith(
        `/booking/login?next=${encodeURIComponent('/booking/recap?kind=vehicle')}`,
      );
    });
    expect(screen.queryByText('Protected checkout')).not.toBeInTheDocument();
  });

  it('renders children when session and access token are valid', async () => {
    vi.mocked(hasWebSession).mockReturnValue(true);
    vi.mocked(getWebSession).mockReturnValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresAt: Date.now() + 60_000,
      user: {
        id: 'u1',
        email: 'a@b.c',
        firstName: 'A',
        lastName: 'B',
        organizationId: null,
        status: 'active',
      },
    } as ReturnType<typeof getWebSession>);
    vi.mocked(ensureClientAccessToken).mockResolvedValue('access');

    renderGuard();

    expect(
      await screen.findByText('Protected checkout', {}, { timeout: 5_000 }),
    ).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
