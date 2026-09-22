'use client';

import { cn } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useSiteSearchNavigator } from './site-search-navigator';

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

export type SiteSearchTriggerProps = {
  className?: string;
  /** Appelé après le toggle (ex. fermer le menu mobile). */
  onAfterToggle?: () => void;
};

/** Bouton loupe — ouvre le navigateur de recherche globale. */
export function SiteSearchTrigger({
  className,
  onAfterToggle,
}: SiteSearchTriggerProps = {}) {
  const t = useTranslations('siteSearch');
  const { open, toggle } = useSiteSearchNavigator();
  const label = t('openLabel');

  return (
    <button
      type="button"
      onClick={() => {
        toggle();
        onAfterToggle?.();
      }}
      aria-label={label}
      title={label}
      aria-expanded={open}
      aria-haspopup="dialog"
      data-testid="site-search-trigger"
      className={cn(
        'relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-atg-border',
        'text-atg-muted transition-colors hover:border-primary hover:text-primary',
        'dark:border-atg-border dark:text-white/75 dark:hover:border-primary dark:hover:text-white',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface',
        open && 'border-primary/40 text-primary',
        className,
      )}
    >
      <SearchLoupeIcon />
    </button>
  );
}
