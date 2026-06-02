'use client';

import { Button } from '@africatourismgate/ui';
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
    <div className="pos-touch flex flex-wrap gap-2">
      {FILTER_OPTIONS.map((filter) => (
        <Button
          key={filter}
          type="button"
          size="lg"
          variant={value === filter ? 'primary' : 'outline'}
          className="min-h-[2.75rem] px-4 text-sm"
          onClick={() => onChange(filter)}
        >
          {filterLabels[filter]}
        </Button>
      ))}
    </div>
  );
}
