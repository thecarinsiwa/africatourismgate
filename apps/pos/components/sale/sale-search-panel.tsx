'use client';

import { Button, Input } from '@africatourismgate/ui';
import { useEffect, useState } from 'react';
import { posSalePageConfig } from '../../config/sale';
import { useSaleCart } from '../../lib/sale/cart-context';
import { searchCatalog } from '../../lib/sale/search-catalog';
import type { SaleCatalogFilter, SaleCatalogHit } from '../../lib/sale/types';
import { SaleLineConfigSheet } from './sale-line-config-sheet';
import { SaleTypeFilters } from './sale-type-filters';

const { search: searchLabels, filters: filterLabels } = posSalePageConfig;

function kindLabel(kind: SaleCatalogHit['kind']): string {
  return filterLabels[kind];
}

export function SaleSearchPanel() {
  const { addLine } = useSaleCart();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SaleCatalogFilter>('all');
  const [hits, setHits] = useState<SaleCatalogHit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHit, setSelectedHit] = useState<SaleCatalogHit | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const trimmed = query.trim();
    const debounceMs = trimmed.length >= 2 ? 300 : 0;

    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);

      void searchCatalog(trimmed, filter)
        .then((results) => {
          if (!cancelled) setHits(results);
        })
        .catch(() => {
          if (!cancelled) {
            setError(searchLabels.errorLabel);
            setHits([]);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, debounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, filter]);

  function openConfig(hit: SaleCatalogHit) {
    setSelectedHit(hit);
    setSheetOpen(true);
  }

  function closeConfig() {
    setSheetOpen(false);
    setSelectedHit(null);
  }

  const isBrowsing = query.trim().length < 2;

  return (
    <div className="flex flex-col gap-5">
      <div className="pos-touch space-y-4">
        <Input
          id="sale-search"
          type="search"
          label={searchLabels.label}
          placeholder={searchLabels.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        <SaleTypeFilters value={filter} onChange={setFilter} />
      </div>

      <div className="min-h-[12rem]">
        {isBrowsing && !loading && !error && hits.length > 0 ? (
          <p className="mb-3 text-sm text-atg-muted">{searchLabels.browseLabel}</p>
        ) : null}

        {isBrowsing && !loading && hits.length === 0 && !error ? (
          <p className="text-center text-base text-atg-muted">{searchLabels.hint}</p>
        ) : null}

        {loading ? (
          <p className="text-center text-base text-atg-muted" aria-busy="true">
            {searchLabels.loadingLabel}
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="text-center text-base text-red-600">
            {error}
          </p>
        ) : null}

        {!loading && !error && !isBrowsing && hits.length === 0 ? (
          <p className="text-center text-base text-atg-muted">{searchLabels.emptyLabel}</p>
        ) : null}

        {!loading && hits.length > 0 ? (
          <ul className="pos-touch space-y-3">
            {hits.map((hit) => (
              <li key={hit.hitId}>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="!h-auto min-h-[4rem] px-4 py-4"
                  onClick={() => openConfig(hit)}
                >
                  <span className="flex w-full flex-col items-start gap-1 text-left">
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="text-lg font-semibold">{hit.title}</span>
                      <span className="shrink-0 rounded-full bg-atg-surface px-2 py-0.5 text-xs font-medium text-atg-muted">
                        {kindLabel(hit.kind)}
                      </span>
                    </span>
                    <span className="text-sm font-normal text-atg-muted">{hit.subtitle}</span>
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <SaleLineConfigSheet
        hit={selectedHit}
        open={sheetOpen}
        onClose={closeConfig}
        onAdd={addLine}
      />
    </div>
  );
}
