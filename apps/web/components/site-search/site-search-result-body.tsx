'use client';

import { cn } from '@africatourismgate/ui';
import type { SiteSearchResultItem } from '../../lib/site-search';
import { SiteSearchGroupIcon } from './site-search-group-icon';

type SiteSearchResultLabels = {
  kindEntity: string;
  kindPrefilled: string;
};

type SiteSearchResultBodyProps = {
  item: SiteSearchResultItem;
  labels: SiteSearchResultLabels;
  /** denser layout for the modal list */
  compact?: boolean;
  /** Show group icon (default true). */
  showIcon?: boolean;
};

/**
 * Shared title / subtitle / kind label for modal and results page.
 */
export function SiteSearchResultBody({
  item,
  labels,
  compact = false,
  showIcon = true,
}: SiteSearchResultBodyProps) {
  const kindLabel =
    item.kind === 'prefilled' ? labels.kindPrefilled : labels.kindEntity;

  return (
    <span className="flex min-w-0 flex-1 items-start gap-3">
      {showIcon ? (
        <span
          className={cn(
            'mt-0.5 flex shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary',
            compact ? 'h-8 w-8' : 'h-9 w-9',
          )}
          aria-hidden
        >
          <SiteSearchGroupIcon group={item.group} />
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-baseline gap-2">
          <span
            className={cn(
              'min-w-0 truncate font-medium text-atg-fg',
              compact ? 'text-sm' : 'text-base font-semibold',
            )}
          >
            {item.title}
          </span>
          <span
            className={cn(
              'shrink-0 text-[10px] font-semibold uppercase tracking-wide',
              item.kind === 'prefilled' ? 'text-atg-muted' : 'text-primary',
            )}
            data-testid="site-search-result-kind"
          >
            {kindLabel}
          </span>
        </span>
        {item.subtitle ? (
          <span
            className={cn(
              'truncate text-atg-muted',
              compact ? 'text-xs' : 'text-sm',
            )}
          >
            {item.subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
