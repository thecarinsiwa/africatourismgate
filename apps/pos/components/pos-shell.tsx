'use client';

import { Button } from '@africatourismgate/ui';
import { useRouter } from 'next/navigation';
import { useLayoutEffect, useState } from 'react';
import { posHomeConfig } from '../config/home';
import { logout } from '../lib/auth/logout';
import { AUTH_CHANGED_EVENT, getSession, type PosStoredSession } from '../lib/auth/session';

const { shell } = posHomeConfig;

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
      <header className="border-b border-atg-border bg-atg-elevated px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
              {shell.organizationLabel}
            </p>
            <p className="truncate text-xl font-bold text-atg-fg">
              {session?.selectedOrganizationName ?? '—'}
            </p>
            <p className="text-sm text-atg-muted">
              {shell.employeeLabel} :{' '}
              <span className="font-medium text-atg-fg">{formatEmployeeName(session)}</span>
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="pos-touch shrink-0 min-h-[3.25rem] px-6 text-base"
            onClick={() => void handleLogout()}
          >
            {shell.logoutLabel}
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
