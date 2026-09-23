'use client';

import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { ThemeToggle, type ThemeToggleProps } from './theme-toggle';
import { UserMenu, type UserMenuProps } from './user-menu';

export type AppHeaderProps = {
  /** Titre contextuel affiché à côté du menu mobile (optionnel). */
  title?: string;
  /** Fil d'Ariane ou slot personnalisé sous le titre. */
  breadcrumb?: ReactNode;
  user: Pick<
    UserMenuProps,
    'displayName' | 'email' | 'avatarSrc' | 'onLogout' | 'logoutLabel' | 'loggingOutLabel' | 'menuLinks'
  >;
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
  breadcrumb,
  user,
  themeLabels,
  actions,
  className,
  onMenuClick,
  openMenuLabel = 'Open menu',
}: AppHeaderProps) {
  const hasHeading = Boolean(title || breadcrumb);

  return (
    <header
      className={cn(
        // Mobile: two rows so the menu never collides with a crowded actions strip.
        'flex shrink-0 flex-col gap-2 border-b border-atg-border bg-atg-elevated px-3 py-2.5',
        'sm:px-4 md:flex-row md:items-center md:justify-between md:gap-4 md:px-6 md:py-4',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5 md:flex-1 md:gap-3">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className={cn(
              'relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-atg-border',
              'bg-atg-elevated text-atg-fg transition-colors hover:bg-atg-surface md:hidden',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            )}
            aria-label={openMenuLabel}
          >
            <MenuIcon />
          </button>
        ) : null}

        <div className="min-w-0 flex-1 space-y-1">
          {title ? (
            <p className="truncate text-base font-bold text-atg-fg sm:text-lg md:text-xl">{title}</p>
          ) : hasHeading ? null : (
            <span className="sr-only">Africa Tourism Gate Admin</span>
          )}
          {breadcrumb}
        </div>
      </div>

      <div
        className={cn(
          'flex min-w-0 items-center gap-1.5 overflow-x-auto overscroll-x-contain',
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'md:shrink-0 md:justify-end md:gap-3 md:overflow-visible',
        )}
      >
        {actions}
        <ThemeToggle labels={themeLabels} />
        <UserMenu {...user} />
      </div>
    </header>
  );
}
