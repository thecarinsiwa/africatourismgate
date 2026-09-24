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
        'flex shrink-0 flex-col gap-2 border-b border-atg-border bg-atg-elevated px-3 py-2',
        'sm:px-4 sm:py-2.5 md:gap-3 md:px-6 md:py-3',
        className,
      )}
    >
      {/* Single toolbar row — title truncates, actions stay on the right. */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className={cn(
              'relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-atg-border',
              'bg-atg-elevated text-atg-fg transition-colors hover:bg-atg-surface sm:h-10 sm:w-10 md:hidden',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            )}
            aria-label={openMenuLabel}
          >
            <MenuIcon />
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          {title ? (
            <p className="truncate text-base font-bold leading-tight text-atg-fg sm:text-lg md:text-xl">
              {title}
            </p>
          ) : hasHeading ? null : (
            <span className="sr-only">Africa Tourism Gate Admin</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5 md:gap-2">
          {actions}
          <ThemeToggle labels={themeLabels} />
          <UserMenu {...user} />
        </div>
      </div>

      {breadcrumb ? <div className="min-w-0">{breadcrumb}</div> : null}
    </header>
  );
}
