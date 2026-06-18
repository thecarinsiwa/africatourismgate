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

      <div className="sticky top-0 z-30 border-b border-atg-border bg-atg-elevated/95 shadow-sm backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm text-atg-muted">{p.resultsFor}</p>
            <p className="text-lg font-bold text-atg-fg">
              {loading ? '…' : listings.length} {p.packagesFound}
            </p>
          </div>
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-atg-muted">{p.sortBy}</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              disabled={loading}
              className="min-h-[44px] rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm font-medium text-atg-fg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:border-atg-border dark:bg-atg-surface dark:text-white"
            >
              <option value="recommended">{p.sortRecommended}</option>
              <option value="price-asc">{p.sortPriceLow}</option>
              <option value="price-desc">{p.sortPriceHigh}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            <p>{p.loadError}</p>
            <button
              type="button"
              onClick={() => setFetchId((value) => value + 1)}
              className="mt-3 min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {p.retry}
            </button>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-atg-border bg-atg-elevated px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <p className="text-sm font-medium text-atg-muted">{p.loading}</p>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-atg-border bg-atg-elevated px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <h3 className="text-lg font-bold text-atg-fg">{p.noResults}</h3>
            <p className="mt-2 text-sm text-atg-muted">{p.noResultsHint}</p>
            <a
              href="#packages-search"
              className="mt-6 mr-3 inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-6 py-2 text-sm font-semibold text-atg-fg hover:border-primary dark:border-atg-border dark:text-white"
            >
              {p.modifySearch}
            </a>
            <Link
              href="/"
              className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {p.backHome}
            </Link>
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="space-y-6">
            {listings.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                t={p}
                searchParams={initialSearch}
              />
            ))}
          </div>
        )}
      </div>

      <HomeFooter />
    </div>
  );
}
