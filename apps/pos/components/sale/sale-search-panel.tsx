'use client';

import { Card, Input } from '@africatourismgate/ui';
import { useEffect, useState } from 'react';
import { posSalePageConfig } from '../../config/sale';
import { useSaleCart } from '../../lib/sale/cart-context';
import { searchCatalog } from '../../lib/sale/search-catalog';
import type { SaleCatalogFilter, SaleCatalogHit } from '../../lib/sale/types';
import { SaleCatalogItem } from './sale-catalog-item';
import { SaleCatalogSkeleton } from './sale-catalog-skeleton';
import { SaleLineConfigSheet } from './sale-line-config-sheet';
import { SaleTypeFilters } from './sale-type-filters';

const { search: searchLabels, filters: filterLabels } = posSalePageConfig;

function kindLabel(kind: SaleCatalogHit['kind']): string {
  return filterLabels[kind];
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
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
  const showResults = !loading && hits.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <Card variant="dashboard" padding="sm">
        <div className="space-y-4">
          <div>
            <label htmlFor="sale-search" className="mb-2 block text-sm font-medium text-atg-fg">
              {searchLabels.label}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-atg-muted">
                <SearchIcon />
              </span>
              <Input
                id="sale-search"
                type="search"
                placeholder={searchLabels.placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                inputClassName="!pl-11 !text-base !min-h-[3rem]"
              />
            </div>
          </div>
          <SaleTypeFilters value={filter} onChange={setFilter} />
        </div>
      </Card>

      <Card variant="dashboard" padding="sm" className="min-h-[20rem]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-atg-fg">
              {isBrowsing ? searchLabels.catalogTitle : searchLabels.resultsTitle}
            </h2>
            {isBrowsing && !loading && !error && hits.length > 0 ? (
              <p className="mt-0.5 text-sm text-atg-muted">{searchLabels.browseLabel}</p>
            ) : null}
            {!isBrowsing && !loading && !error ? (
              <p className="mt-0.5 text-sm text-atg-muted">
                {searchLabels.resultsFor(query.trim())}
              </p>
            ) : null}
          </div>
          {showResults ? (
            <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              {searchLabels.resultCount(hits.length)}
            </span>
          ) : null}
        </div>

        {loading ? <SaleCatalogSkeleton /> : null}

        {!loading && error ? (
          <div
            role="alert"
            className="flex flex-col items-center justify-center rounded-xl border border-red-500/30 bg-red-500/5 px-6 py-10 text-center"
          >
            <p className="text-base font-medium text-red-600 dark:text-red-400">{error}</p>
            <p className="mt-2 text-sm text-atg-muted">{searchLabels.errorHint}</p>
          </div>
        ) : null}

        {!loading && !error && isBrowsing && hits.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-atg-border bg-atg-surface/30 px-6 py-12 text-center">
            <p className="text-base text-atg-muted">{searchLabels.hint}</p>
          </div>
        ) : null}

        {!loading && !error && !isBrowsing && hits.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-atg-border bg-atg-surface/30 px-6 py-12 text-center">
            <p className="text-base font-medium text-atg-fg">{searchLabels.emptyLabel}</p>
            <p className="mt-2 text-sm text-atg-muted">{searchLabels.emptyHint}</p>
          </div>
        ) : null}

        {showResults ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {hits.map((hit) => (
              <li key={hit.hitId}>
                <SaleCatalogItem
                  hit={hit}
                  kindLabel={kindLabel(hit.kind)}
                  onSelect={openConfig}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </Card>

      <SaleLineConfigSheet
        hit={selectedHit}
        open={sheetOpen}
        onClose={closeConfig}
        onAdd={addLine}
      />
    </div>
  );
}
