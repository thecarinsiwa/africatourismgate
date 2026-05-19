'use client';

import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { ThemeToggle, type ThemeToggleProps } from './theme-toggle';
import { UserMenu, type UserMenuProps } from './user-menu';

export type AppHeaderProps = {
  title?: string;
  user: Pick<UserMenuProps, 'displayName' | 'email' | 'onLogout' | 'logoutLabel' | 'menuLinks'>;
  themeLabels?: ThemeToggleProps['labels'];
  actions?: ReactNode;
  className?: string;
  onMenuClick?: () => void;
  openMenuLabel?: string;
};

function MenuIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function AppHeader({
  title,
  user,
  themeLabels,
  actions,
  className,
  onMenuClick,
  openMenuLabel = 'Ouvrir le menu',
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        'flex shrink-0 items-center justify-between gap-4 border-b border-atg-border bg-atg-elevated px-4 py-3 md:px-6 md:py-4',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className={cn(
              'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-atg-border',
              'bg-atg-elevated text-atg-fg transition-colors hover:bg-atg-surface md:hidden',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            )}
            aria-label={openMenuLabel}
          >
            <MenuIcon />
          </button>
        ) : null}

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
