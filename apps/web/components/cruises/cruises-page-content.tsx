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
import { ListingPageBody, ListingSortBar } from '../shared/listing-patterns';
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

      <ListingSortBar
        resultsLine={
          <>
            {c.resultsFor}{' '}
            <strong className="text-atg-fg">{displayRoute}</strong>
          </>
        }
        countLine={
          <>
            {loading ? '…' : listings.length} {c.sailingsFound}
          </>
        }
        sortLabel={c.sortBy}
        sortValue={sort}
        sortOptions={[
          { value: 'recommended', label: c.sortRecommended },
          { value: 'price-asc', label: c.sortPriceLow },
          { value: 'price-desc', label: c.sortPriceHigh },
        ]}
        onSortChange={(value) => setSort(value as SortKey)}
        disabled={loading}
      />

      <ListingPageBody
        error={
          error
            ? {
                message: c.loadError,
                retryLabel: c.retry,
                onRetry: () => setFetchId((value) => value + 1),
              }
            : null
        }
        loading={loading}
        loadingMessage={c.loading}
        isEmpty={!loading && !error && listings.length === 0}
        empty={{
          title: c.noResults,
          description:
            hasRouteFilter || hasDateFilter ? c.noResultsHint : c.browseAllHint,
          backHomeLabel: c.backHome,
          modifySearchLabel: c.modifySearch,
          modifySearchHref: '#cruises-search',
        }}
      >
        {listings.map((sailing) => (
          <CruiseCard
            key={sailing.id}
            sailing={sailing}
            t={c}
            searchParams={initialSearch}
            locale={locale}
          />
        ))}
      </ListingPageBody>

      <HomeFooter />
    </div>
  );
}
