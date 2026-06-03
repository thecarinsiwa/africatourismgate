'use client';

import { DashboardShell } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildAdminDashboardNav } from '../config/dashboard-nav';
import { adminDashboardConfig } from '../config/dashboard';
import { logout } from '../lib/auth/logout';
import { AUTH_CHANGED_EVENT, getSession } from '../lib/auth/session';
import type { StoredSession } from '../lib/auth/session';
import { useOrganizationThemeOptional } from './organization-theme-provider';
import { SessionSync } from './session-sync';
import { LanguageSwitcher } from './language-switcher';

function formatDisplayName(firstName: string, lastName: string, email: string): string {
  const name = `${firstName} ${lastName}`.trim();
  return name || email;
}

export function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const orgTheme = useOrganizationThemeOptional();
  const tNav = useTranslations('nav');
  const tTheme = useTranslations('theme');
  const [session, setSession] = useState<StoredSession | null>(null);

  const navItems = useMemo(
    () => buildAdminDashboardNav((key) => tNav(key as Parameters<typeof tNav>[0])),
    [tNav],
  );

  useEffect(() => {
    function syncSession() {
      setSession(getSession());
    }

    syncSession();
    window.addEventListener(AUTH_CHANGED_EVENT, syncSession);
    window.addEventListener('storage', syncSession);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncSession);
      window.removeEventListener('storage', syncSession);
    };
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
    : { displayName: tNav('userMenu.defaultUser'), email: '' };

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
    router.refresh();
  }, [router]);

  return (
    <>
      <SessionSync />
      <DashboardShell
        navItems={navItems}
        headerActions={<LanguageSwitcher />}
        logo={{
          name: orgTheme?.branding?.displayName ?? adminDashboardConfig.logo.name,
          href: adminDashboardConfig.logo.href,
          logoUrl: orgTheme?.branding?.logoUrl,
        }}
        user={{
          ...user,
          onLogout: handleLogout,
          menuLinks: [
            { href: '/dashboard', label: tNav('userMenu.dashboard') },
            { href: '/parametres', label: tNav('userMenu.settings') },
          ],
        }}
        themeLabels={{
          light: tTheme('light'),
          dark: tTheme('dark'),
        }}
      >
        {children}
      </DashboardShell>
    </>
  );
}
