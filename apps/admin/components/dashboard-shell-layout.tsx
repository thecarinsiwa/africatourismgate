'use client';

import { DashboardShell } from '@africatourismgate/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { StoredSession } from '../lib/auth/session';
import { adminDashboardConfig, adminDashboardNav } from '../config/dashboard';
import { adminLoginPageConfig } from '../config/login';
import { logout } from '../lib/auth/logout';
import { getSession } from '../lib/auth/session';
import { useOrganizationThemeOptional } from './organization-theme-provider';
import { SessionSync } from './session-sync';

function formatDisplayName(firstName: string, lastName: string, email: string): string {
  const name = `${firstName} ${lastName}`.trim();
  return name || email;
}

export function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const orgTheme = useOrganizationThemeOptional();
  const [session, setSession] = useState<StoredSession | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const user = session?.user
    ? {
        displayName: formatDisplayName(
          session.user.firstName,
          session.user.lastName,
          session.user.email,
        ),
        email: session.user.email,
      }
    : { displayName: 'Utilisateur', email: '' };

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
    router.refresh();
  }, [router]);

  return (
    <>
      <SessionSync />
      <DashboardShell
        navItems={adminDashboardNav}
        logo={{
          name: orgTheme?.branding?.displayName ?? adminDashboardConfig.logo.name,
          href: adminDashboardConfig.logo.href,
          logoUrl: orgTheme?.branding?.logoUrl,
        }}
        user={{
          ...user,
          onLogout: handleLogout,
          menuLinks: [
            { href: '/dashboard', label: 'Tableau de bord' },
            { href: '/parametres', label: 'Paramètres' },
          ],
        }}
        themeLabels={{
          light: adminLoginPageConfig.theme.light,
          dark: adminLoginPageConfig.theme.dark,
        }}
      >
        {children}
      </DashboardShell>
    </>
  );
}
