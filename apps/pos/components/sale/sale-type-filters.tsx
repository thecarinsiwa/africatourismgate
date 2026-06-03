'use client';

import { cn } from '@africatourismgate/ui';
import { posSalePageConfig } from '../../config/sale';
import type { SaleCatalogFilter } from '../../lib/sale/types';

const { filters: filterLabels } = posSalePageConfig;

const FILTER_OPTIONS: SaleCatalogFilter[] = [
  'all',
  'activity',
  'room',
  'flight_class',
  'vehicle',
  'cabin',
];

type SaleTypeFiltersProps = {
  value: SaleCatalogFilter;
  onChange: (filter: SaleCatalogFilter) => void;
};

export function SaleTypeFilters({ value, onChange }: SaleTypeFiltersProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Filtrer par type de produit"
    >
      {FILTER_OPTIONS.map((filter) => {
        const active = value === filter;
        return (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(filter)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-elevated',
              active
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-atg-border bg-atg-surface/60 text-atg-muted hover:border-primary/30 hover:bg-atg-surface hover:text-atg-fg',
            )}
          >
            {filterLabels[filter]}
          </button>
        );
      })}
    </div>
  );
}
