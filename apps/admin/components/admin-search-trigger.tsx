'use client';

import { cn } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useAdminSearchNavigator } from './admin-search-navigator';

function SearchLoupeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-5 w-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

/** Bouton loupe du header — ouvre le navigateur de recherche globale. */
export function AdminSearchTrigger() {
  const t = useTranslations('common.globalSearch');
  const { open, toggle } = useAdminSearchNavigator();
  const label = t('openLabel');

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-expanded={open}
      aria-haspopup="dialog"
      data-testid="admin-search-trigger"
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-atg-border bg-atg-elevated sm:h-10 sm:w-10',
        'text-atg-fg transition-colors hover:bg-atg-surface',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface',
        open && 'border-primary/40 bg-atg-surface text-primary',
      )}
    >
      <SearchLoupeIcon />
    </button>
  );
}
