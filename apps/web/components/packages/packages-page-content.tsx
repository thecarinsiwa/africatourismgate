'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { browsePackages } from '../../lib/api/public';
import {
  buildPackagesSearchQuery,
  toPackagesBrowseQuery,
  type PackagesSearchParams,
} from '../../lib/packages/listings';
import type { PackageListItem } from '../../lib/packages/types';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { ListingPageBody, ListingSortBar } from '../shared/listing-patterns';
import { PackageCard } from './package-card';

export type { PackagesSearchParams };

type SortKey = 'recommended' | 'price-asc' | 'price-desc';

type PackagesPageContentProps = {
  initialSearch: PackagesSearchParams;
};

export function PackagesPageContent({ initialSearch }: PackagesPageContentProps) {
  const t = useTranslations();
  const p = t.packages;
  const router = useRouter();

  const [searchInput, setSearchInput] = useState(initialSearch.search ?? '');
  const [sort, setSort] = useState<SortKey>('recommended');
  const [results, setResults] = useState<PackageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const browseQuery = useMemo(
    () => toPackagesBrowseQuery(initialSearch),
    [initialSearch],
  );

  useEffect(() => {
    setSearchInput(initialSearch.search ?? '');
  }, [initialSearch.search]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(false);

    void browsePackages(browseQuery)
      .then((response) => {
        if (!cancelled) setResults(response.data);
      })
      .catch(() => {
        if (!cancelled) {
          setResults([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [browseQuery, fetchId]);

  const listings = useMemo(() => {
    const items = [...results];
    switch (sort) {
      case 'price-asc':
        return items.sort((a, b) => a.pricing.totalCents - b.pricing.totalCents);
      case 'price-desc':
        return items.sort((a, b) => b.pricing.totalCents - a.pricing.totalCents);
      default:
        return items;
    }
  }, [results, sort]);

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(
      `/packages${buildPackagesSearchQuery({
        ...initialSearch,
        search: searchInput.trim() || undefined,
        page: undefined,
      })}`,
    );
  }

  const searchSummary = initialSearch.search
    ? `${p.searchLabel}: ${initialSearch.search}`
    : p.browseHint;

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />

      <section className="relative overflow-hidden bg-[#0f2744] text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2744] via-[#0f2744]/95 to-primary/40" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav
            className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-white">
              {p.breadcrumbHome}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-white">{p.breadcrumbPackages}</span>
          </nav>

          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {p.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {p.heroSubtitle}
          </p>

          <p className="mt-6 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
            {searchSummary}
          </p>

          <form
            id="packages-search"
            onSubmit={handleSearchSubmit}
            className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <label className="sr-only" htmlFor="packages-search-input">
              {p.searchLabel}
            </label>
            <input
              id="packages-search-input"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={p.searchPlaceholder}
              className="min-h-[44px] flex-1 rounded-lg border border-white/20 bg-white/10 px-4 text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              type="submit"
              className="min-h-[44px] rounded-lg bg-primary px-6 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-hover"
            >
              {p.searchSubmit}
            </button>
          </form>
        </div>
      </section>

      <ListingSortBar
        resultsLine={p.resultsFor}
        countLine={
          <>
            {loading ? '…' : listings.length} {p.packagesFound}
          </>
        }
        sortLabel={p.sortBy}
        sortValue={sort}
        sortOptions={[
          { value: 'recommended', label: p.sortRecommended },
          { value: 'price-asc', label: p.sortPriceLow },
          { value: 'price-desc', label: p.sortPriceHigh },
        ]}
        onSortChange={(value) => setSort(value as SortKey)}
        disabled={loading}
      />

      <ListingPageBody
        error={
          error
            ? {
                message: p.loadError,
                retryLabel: p.retry,
                onRetry: () => setFetchId((value) => value + 1),
              }
            : null
        }
        loading={loading}
        loadingMessage={p.loading}
        isEmpty={!loading && !error && listings.length === 0}
        empty={{
          title: p.noResults,
          description: p.noResultsHint,
          backHomeLabel: p.backHome,
          modifySearchLabel: p.modifySearch,
          modifySearchHref: '#packages-search',
        }}
      >
        {listings.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} t={p} searchParams={initialSearch} />
        ))}
      </ListingPageBody>

      <HomeFooter />
    </div>
  );
}
