'use client';

import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { AppShell } from '../app-shell';
import { AppHeader, type AppHeaderProps } from './app-header';
import { Sidebar, type SidebarNavEntry } from './sidebar';

export type DashboardShellProps = {
  navItems: SidebarNavEntry[];
  user: AppHeaderProps['user'];
  themeLabels?: AppHeaderProps['themeLabels'];
  logo?: { name: string; href?: string; logoUrl?: string | null };
  children: ReactNode;
  openMenuLabel?: string;
  closeMenuLabel?: string;
  headerActions?: ReactNode;
  /** Titre contextuel dans l'en-tête (optionnel). */
  title?: string;
  /** Fil d'Ariane dans l'en-tête (optionnel). */
  breadcrumb?: ReactNode;
};

export function DashboardShell({
  navItems,
  user,
  themeLabels,
  logo,
  children,
  openMenuLabel,
  closeMenuLabel,
  headerActions,
  title,
  breadcrumb,
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <AppShell>
      <div className="flex min-h-screen flex-col bg-atg-surface md:flex-row">
        <Sidebar
          navItems={navItems}
          logo={logo}
          mobileOpen={mobileNavOpen}
          onMobileClose={closeMobileNav}
          closeMenuLabel={closeMenuLabel}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AppHeader
            title={title}
            breadcrumb={breadcrumb}
            user={user}
            themeLabels={themeLabels}
            actions={headerActions}
            onMenuClick={openMobileNav}
            openMenuLabel={openMenuLabel}
          />
          <main className="flex-1 overflow-auto bg-atg-surface p-6 md:p-8">{children}</main>
        </div>
      </div>
    </AppShell>
  );
}
