'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { searchCruises } from '../../lib/api/public';
import {
  toCruiseSearchQuery,
  type CruisesSearchParams,
} from '../../lib/cruises/listings';
import { formatCruisePortLabel } from '../../lib/cruises/ports';
import type { CruiseSearchResult } from '../../lib/cruises/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { CruiseCard } from './cruise-card';
import { CruisesSearchForm } from './cruises-search-form';

export type { CruisesSearchParams };

type SortKey = 'recommended' | 'price-asc' | 'price-desc';

type CruisesPageContentProps = {
  initialSearch: CruisesSearchParams;
};

export function CruisesPageContent({ initialSearch }: CruisesPageContentProps) {
  const t = useTranslations();
  const c = t.cruises;
  const { locale } = useLocale();

  const [sort, setSort] = useState<SortKey>('recommended');
  const [results, setResults] = useState<CruiseSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const apiQuery = useMemo(() => toCruiseSearchQuery(initialSearch), [initialSearch]);
  const hasRouteFilter = Boolean(initialSearch.sailFrom || initialSearch.sailTo);
  const hasDateFilter = Boolean(initialSearch.startDate || initialSearch.endDate);
  const displayRoute =
    initialSearch.sailFrom && initialSearch.sailTo
      ? `${formatCruisePortLabel(initialSearch.sailFrom)} → ${formatCruisePortLabel(initialSearch.sailTo)}`
      : initialSearch.sailFrom
        ? `${formatCruisePortLabel(initialSearch.sailFrom)} → ${c.anyRoute}`
        : initialSearch.sailTo
          ? `${c.anyRoute} → ${formatCruisePortLabel(initialSearch.sailTo)}`
          : c.anyRoute;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    void searchCruises(apiQuery)
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
  }, [apiQuery, fetchId]);

  const listings = useMemo(() => {
    const items = [...results];
    switch (sort) {
      case 'price-asc':
        return items.sort((a, b) => a.minPriceCents - b.minPriceCents);
      case 'price-desc':
        return items.sort((a, b) => b.minPriceCents - a.minPriceCents);
      default:
        return items;
    }
  }, [results, sort]);

  const searchSummary = [
    initialSearch.startDate &&
      `${c.startDate}: ${formatDisplayDate(initialSearch.startDate, locale)}`,
    initialSearch.endDate &&
      `${c.endDate}: ${formatDisplayDate(initialSearch.endDate, locale)}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />

      <section className="relative overflow-hidden bg-[#0f2744] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              'url("https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Congo_River_near_Kisangani.jpg/1280px-Congo_River_near_Kisangani.jpg")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2744] via-[#0f2744]/90 to-[#0f2744]/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav
            className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-white">
              {c.breadcrumbHome}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-white">{c.breadcrumbCruises}</span>
          </nav>

          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {c.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {c.heroSubtitle}
          </p>

          {searchSummary ? (
            <p className="mt-6 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              {searchSummary}
            </p>
          ) : (
            <p className="mt-6 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              {c.browseAllHint}
            </p>
          )}

          <CruisesSearchForm initialValues={initialSearch} />
        </div>
      </section>

      <div className="sticky top-0 z-30 border-b border-atg-border bg-atg-elevated/95 shadow-sm backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm text-atg-muted">
              {c.resultsFor}{' '}
              <strong className="text-atg-fg">{displayRoute}</strong>
            </p>
            <p className="text-lg font-bold text-atg-fg">
              {loading ? '…' : listings.length} {c.sailingsFound}
            </p>
          </div>
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-atg-muted">{c.sortBy}</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              disabled={loading}
              className="min-h-[44px] rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm font-medium text-atg-fg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:border-atg-border dark:bg-atg-surface dark:text-white"
            >
              <option value="recommended">{c.sortRecommended}</option>
              <option value="price-asc">{c.sortPriceLow}</option>
              <option value="price-desc">{c.sortPriceHigh}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            <p>{c.loadError}</p>
            <button
              type="button"
              onClick={() => setFetchId((value) => value + 1)}
              className="mt-3 min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {c.retry}
            </button>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-atg-border bg-atg-elevated px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <p className="text-sm font-medium text-atg-muted">{c.loading}</p>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-atg-border bg-atg-elevated px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <h3 className="text-lg font-bold text-atg-fg">{c.noResults}</h3>
            <p className="mt-2 text-sm text-atg-muted">
              {hasRouteFilter || hasDateFilter ? c.noResultsHint : c.browseAllHint}
            </p>
            <a
              href="#cruises-search"
              className="mt-6 mr-3 inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-6 py-2 text-sm font-semibold text-atg-fg hover:border-primary dark:border-atg-border dark:text-white"
            >
              {c.modifySearch}
            </a>
            <Link
              href="/"
              className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {c.backHome}
            </Link>
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="space-y-6">
            {listings.map((sailing) => (
              <CruiseCard
                key={sailing.id}
                sailing={sailing}
                t={c}
                searchParams={initialSearch}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>

      <HomeFooter />
    </div>
  );
}
