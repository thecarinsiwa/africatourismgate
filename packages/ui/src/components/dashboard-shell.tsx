'use client';

import type { ReactNode } from 'react';
import { AppShell } from '../app-shell';
import { AppHeader, type AppHeaderProps } from './app-header';
import { Sidebar, type SidebarNavItem } from './sidebar';

export type DashboardShellProps = {
  navItems: SidebarNavItem[];
  user: AppHeaderProps['user'];
  themeLabels?: AppHeaderProps['themeLabels'];
  logo?: { name: string; href?: string };
  children: ReactNode;
};

export function DashboardShell({
  navItems,
  user,
  themeLabels,
  logo,
  children,
}: DashboardShellProps) {
  return (
    <AppShell>
      <div className="flex min-h-screen flex-col bg-atg-surface md:flex-row">
        <Sidebar navItems={navItems} logo={logo} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AppHeader user={user} themeLabels={themeLabels} />
          <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
        </div>
      </div>
    </AppShell>
  );
}
