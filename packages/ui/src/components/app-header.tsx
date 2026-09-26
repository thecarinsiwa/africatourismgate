'use client';

import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { ThemeToggle, type ThemeToggleProps } from './theme-toggle';
import { UserMenu, type UserMenuProps } from './user-menu';

export type AppHeaderProps = {
  /** Titre contextuel affiché sous la barre d'actions (optionnel). */
  title?: string;
  /** Fil d'Ariane ou slot personnalisé sous le titre. */
  breadcrumb?: ReactNode;
  user: Pick<
    UserMenuProps,
    | 'displayName'
    | 'email'
    | 'avatarSrc'
    | 'onLogout'
    | 'logoutLabel'
    | 'loggingOutLabel'
    | 'menuLinks'
    | 'menuActions'
  >;
  themeLabels?: ThemeToggleProps['labels'];
  actions?: ReactNode;
  className?: string;
  onMenuClick?: () => void;
  openMenuLabel?: string;
};

function MenuIcon() {
  return (
    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
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
        'sticky top-0 z-30 flex shrink-0 flex-col gap-1.5 border-b border-atg-border bg-atg-elevated px-3 py-2',
        'sm:gap-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3',
        className,
      )}
    >
      {/* Toolbar: menu + actions (same control size). Title sits below. */}
      <div className="flex min-w-0 items-center gap-2">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className={cn(
              'relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-atg-border',
              'bg-atg-elevated text-atg-fg transition-colors hover:bg-atg-surface sm:h-9 sm:w-9 md:hidden',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            )}
            aria-label={openMenuLabel}
          >
            <MenuIcon />
          </button>
        ) : null}

        <div className="ml-auto flex min-w-0 max-w-full flex-wrap items-center justify-end gap-1 sm:gap-1.5 md:gap-2">
          {actions}
          <ThemeToggle labels={themeLabels} />
          <UserMenu {...user} />
        </div>
      </div>

      {title ? (
        <p className="min-w-0 truncate text-xs font-semibold leading-tight text-atg-fg sm:text-sm md:text-base">
          {title}
        </p>
      ) : hasHeading ? null : (
        <span className="sr-only">Africa Tourism Gate Admin</span>
      )}

      {breadcrumb ? <div className="min-w-0">{breadcrumb}</div> : null}
    </header>
  );
}
