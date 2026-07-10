'use client';

import { Breadcrumb, DashboardShell } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AdminPageMetaProvider,
  useAdminPageMeta,
} from './admin-page-meta-context';
import { buildAdminBreadcrumbRoutes, buildAdminDashboardNav } from '../config/dashboard-nav';
import { adminDashboardConfig } from '../config/dashboard';
import { logout } from '../lib/auth/logout';
import { AUTH_CHANGED_EVENT, getSession } from '../lib/auth/session';
import type { StoredSession } from '../lib/auth/session';
import {
  breadcrumbFromPath,
  buildAdminBreadcrumbHrefLabels,
  resolveAdminPageTitle,
} from '../lib/breadcrumb-from-path';
import { filterAdminNav } from '../lib/auth/filter-admin-nav';
import { usePermissions } from '../lib/auth/use-permissions';
import { useOrganizationThemeOptional } from './organization-theme-provider';
import { RouteAccessGate } from './route-access-gate';
import { SessionSync } from './session-sync';
import { LanguageSwitcher } from './language-switcher';
import { CommandPalette } from './command-palette';

function formatDisplayName(firstName: string, lastName: string, email: string): string {
  const name = `${firstName} ${lastName}`.trim();
  return name || email;
}

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const orgTheme = useOrganizationThemeOptional();
  const tNav = useTranslations('nav');
  const tTheme = useTranslations('theme');
  const tShell = useTranslations('nav.shell');
  const { meta } = useAdminPageMeta();
  const { permissions, isSuperAdmin, loading: permissionsLoading } = usePermissions();
  const [session, setSession] = useState<StoredSession | null>(null);

  const navItems = useMemo(() => {
    const allItems = buildAdminDashboardNav((key) => tNav(key as Parameters<typeof tNav>[0]));
    if (permissionsLoading) return allItems;
    return filterAdminNav(allItems, { permissions, isSuperAdmin });
  }, [tNav, permissions, isSuperAdmin, permissionsLoading]);

  const breadcrumbRoutes = useMemo(
    () => buildAdminBreadcrumbRoutes((key) => tNav(key as Parameters<typeof tNav>[0])),
    [tNav],
  );

  const hrefLabels = useMemo(
    () => buildAdminBreadcrumbHrefLabels(navItems, breadcrumbRoutes),
    [navItems, breadcrumbRoutes],
  );

  const breadcrumbItems = useMemo(
    () => breadcrumbFromPath(pathname, { hrefLabels, tail: meta.breadcrumbTail }),
    [pathname, hrefLabels, meta.breadcrumbTail],
  );

  const autoTitle = useMemo(
    () => resolveAdminPageTitle(pathname, hrefLabels),
    [pathname, hrefLabels],
  );

  const headerTitle = meta.title ?? autoTitle;

  const showShellBreadcrumb = breadcrumbItems.length >= 2;

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
    <DashboardShell
      navItems={navItems}
      title={headerTitle}
      breadcrumb={
        showShellBreadcrumb ? <Breadcrumb items={breadcrumbItems} /> : undefined
      }
      headerActions={<LanguageSwitcher />}
      openMenuLabel={tShell('openMenu')}
      closeMenuLabel={tShell('closeMenu')}
      logo={{
        name: orgTheme?.branding?.displayName ?? adminDashboardConfig.logo.name,
        href: adminDashboardConfig.logo.href,
        logoUrl: orgTheme?.branding?.logoUrl,
      }}
      user={{
        ...user,
        onLogout: handleLogout,
        logoutLabel: tShell('logout'),
        loggingOutLabel: tShell('loggingOut'),
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
      <CommandPalette />
      <RouteAccessGate>{children}</RouteAccessGate>
    </DashboardShell>
  );
}

export function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionSync />
      <AdminPageMetaProvider>
        <DashboardShellInner>{children}</DashboardShellInner>
      </AdminPageMetaProvider>
    </>
  );
}
