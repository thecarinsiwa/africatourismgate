'use client';

import { Button, Logo, ThemeToggle } from '@africatourismgate/ui';
import { useRouter } from 'next/navigation';
import { useLayoutEffect, useState } from 'react';
import { posHomeConfig } from '../config/home';
import { logout } from '../lib/auth/logout';
import { AUTH_CHANGED_EVENT, getSession, type PosStoredSession } from '../lib/auth/session';

const { shell, brandName, brandTagline, theme } = posHomeConfig;

function formatEmployeeName(session: PosStoredSession | null): string {
  if (!session) return '—';
  return `${session.user.firstName} ${session.user.lastName}`.trim();
}

function usePosSession(): PosStoredSession | null {
  const [session, setSession] = useState<PosStoredSession | null>(null);

  useLayoutEffect(() => {
    const sync = () => setSession(getSession());

    sync();
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return session;
}

type PosShellProps = {
  children: React.ReactNode;
};

export function PosShell({ children }: PosShellProps) {
  const router = useRouter();
  const session = usePosSession();

  async function handleLogout() {
    await logout();
    router.refresh();
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface">
      <header className="pos-no-print border-b border-atg-border bg-atg-elevated/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Logo name={brandName} />
              <p className="mt-1 text-xs font-medium text-atg-muted">{brandTagline}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle labels={{ light: theme.light, dark: theme.dark }} />
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="pos-touch min-h-[3rem] px-4 text-sm md:px-5 md:text-base"
                onClick={() => void handleLogout()}
              >
                {shell.logoutLabel}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-atg-border bg-atg-surface/60 px-4 py-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {shell.organizationLabel}
              </p>
              <p className="truncate text-base font-semibold text-atg-fg">
                {session?.selectedOrganizationName ?? '—'}
              </p>
            </div>
            <div className="hidden h-8 w-px bg-atg-border sm:block" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {shell.employeeLabel}
              </p>
              <p className="truncate font-medium text-atg-fg">{formatEmployeeName(session)}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
