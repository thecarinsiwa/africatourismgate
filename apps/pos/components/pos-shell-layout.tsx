'use client';

import { DashboardShell } from '@africatourismgate/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { posHomeConfig } from '../config/home';
import { posLoginPageConfig } from '../config/login';
import { posNavItems } from '../config/nav';
import { posShellConfig } from '../config/shell';
import { applyFaviconToDocument } from '../lib/document-branding';
import { logout } from '../lib/auth/logout';
import { fetchPublicBranding } from '../lib/public-branding';
import {
  AUTH_CHANGED_EVENT,
  getSession,
  type PosStoredSession,
} from '../lib/auth/session';

function formatDisplayName(session: PosStoredSession): string {
  const name = `${session.user.firstName} ${session.user.lastName}`.trim();
  return name || session.user.email;
}

function formatUserSubtitle(session: PosStoredSession): string {
  const org = session.selectedOrganizationName?.trim();
  if (org) {
    return org;
  }
  return session.user.email;
}

export function PosShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<PosStoredSession | null>(null);
  const [logo, setLogo] = useState<{ name: string; logoUrl: string | null }>({
    name: posShellConfig.logo.name,
    logoUrl: null,
  });

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

  useEffect(() => {
    let cancelled = false;
    void fetchPublicBranding().then((branding) => {
      if (cancelled) return;
      setLogo({
        name: `${branding.displayName} — Caisse`,
        logoUrl: branding.logoUrl,
      });
      applyFaviconToDocument(branding.faviconUrl);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
    router.refresh();
  }, [router]);

  const user = session
    ? {
        displayName: formatDisplayName(session),
        email: formatUserSubtitle(session),
        onLogout: handleLogout,
        logoutLabel: posHomeConfig.shell.logoutLabel,
        menuLinks: [...posShellConfig.userMenuLinks],
      }
    : {
        displayName: 'Employé',
        email: '',
        onLogout: handleLogout,
        logoutLabel: posHomeConfig.shell.logoutLabel,
        menuLinks: [...posShellConfig.userMenuLinks],
      };

  return (
    <DashboardShell
      navItems={posNavItems}
      logo={{
        name: logo.name,
        href: posShellConfig.logo.href,
        logoUrl: logo.logoUrl,
      }}
      user={user}
      themeLabels={{
        light: posLoginPageConfig.theme.light,
        dark: posLoginPageConfig.theme.dark,
      }}
      openMenuLabel={posShellConfig.openMenuLabel}
      closeMenuLabel={posShellConfig.closeMenuLabel}
    >
      <div className="pos-touch">{children}</div>
    </DashboardShell>
  );
}
