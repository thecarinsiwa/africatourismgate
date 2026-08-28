'use client';

import { cn } from '@africatourismgate/ui';
import { formatCents } from '../../lib/sale/format';
import type { SaleCatalogHit } from '../../lib/sale/types';
import { getSaleKindStyles, SaleKindBadge, SaleKindIcon } from './sale-kind-meta';

type SaleCatalogItemProps = {
  hit: SaleCatalogHit;
  kindLabel: string;
  onSelect: (hit: SaleCatalogHit) => void;
};

export function SaleCatalogItem({ hit, kindLabel, onSelect }: SaleCatalogItemProps) {
  const styles = getSaleKindStyles(hit.kind);

  return (
    <button
      type="button"
      onClick={() => onSelect(hit)}
      className={cn(
        'group flex w-full flex-col rounded-xl border border-atg-border bg-atg-surface/40 p-4 text-left',
        'touch-manipulation select-none transition-all duration-150 active:scale-[0.99]',
        'hover:border-primary/35 hover:bg-primary/[0.04] hover:shadow-md hover:shadow-black/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-elevated',
        'dark:hover:shadow-black/30',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-transparent transition-all',
            styles.bg,
            styles.text,
            styles.ring,
            'group-hover:ring-1',
          )}
          aria-hidden
        >
          <SaleKindIcon kind={hit.kind} className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-base font-semibold leading-snug text-atg-fg">{hit.title}</p>
            <SaleKindBadge kind={hit.kind} label={kindLabel} />
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm text-atg-muted">{hit.subtitle}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-atg-border/70 pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-atg-muted">
          Ajouter au panier
        </span>
        <span className="text-base font-bold text-primary">
          {formatCents(hit.priceCents, hit.currency)}
        </span>
      </div>
    </button>
  );
}
