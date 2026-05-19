'use client';

import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { ThemeToggle, type ThemeToggleProps } from './theme-toggle';
import { UserMenu, type UserMenuProps } from './user-menu';

export type AppHeaderProps = {
  title?: string;
  user: Pick<UserMenuProps, 'displayName' | 'email' | 'onLogout' | 'logoutLabel'>;
  themeLabels?: ThemeToggleProps['labels'];
  actions?: ReactNode;
  className?: string;
};

export function AppHeader({ title, user, themeLabels, actions, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        'flex shrink-0 items-center justify-between gap-4 border-b border-atg-border bg-atg-elevated px-4 py-3 md:px-6 md:py-4',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {title ? (
          <h1 className="truncate text-lg font-bold text-atg-fg md:text-xl">{title}</h1>
        ) : (
          <span className="sr-only">Africa Tourism Gate Admin</span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {actions}
        <ThemeToggle labels={themeLabels} />
        <UserMenu {...user} />
      </div>
    </header>
  );
}
