'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { browseActivities, searchActivities } from '../../lib/api/public';
import {
  hasRequiredActivitySearchParams,
  toActivityBrowseQuery,
  toActivitySearchQuery,
  type ActivitiesSearchParams,
} from '../../lib/activities/listings';
import type { ActivitySearchResult } from '../../lib/activities/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { ActivitiesSearchForm } from './activities-search-form';
import { ActivityCard } from './activity-card';

export type { ActivitiesSearchParams };

type SortKey = 'recommended' | 'price-asc' | 'price-desc';

type ActivitiesPageContentProps = {
  initialSearch: ActivitiesSearchParams;
};

export function ActivitiesPageContent({ initialSearch }: ActivitiesPageContentProps) {
  const t = useTranslations();
  const a = t.activities;
  const { locale } = useLocale();

  const [sort, setSort] = useState<SortKey>('recommended');
  const [results, setResults] = useState<ActivitySearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const hasDateSearch = hasRequiredActivitySearchParams(initialSearch);
  const browseQuery = useMemo(
    () => toActivityBrowseQuery(initialSearch),
    [initialSearch],
  );
  const searchQuery = useMemo(() => {
    if (!hasDateSearch) return null;
    try {
      return toActivitySearchQuery(initialSearch);
    } catch {
      return null;
    }
  }, [initialSearch, hasDateSearch]);

  const displayDestination =
    initialSearch.destination?.trim() || a.anyDestination;

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(false);

    const request = hasDateSearch && searchQuery
      ? searchActivities(searchQuery)
      : browseActivities(browseQuery);

    void request
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
  }, [browseQuery, searchQuery, hasDateSearch, fetchId]);

  const listings = useMemo(() => {
    const items = [...results];
    switch (sort) {
      case 'price-asc':
        return items.sort((a, b) => a.priceCents - b.priceCents);
      case 'price-desc':
        return items.sort((a, b) => b.priceCents - a.priceCents);
      default:
        return items;
    }
  }, [results, sort]);

  const searchSummary = [
    initialSearch.destination && `${a.destination}: ${initialSearch.destination}`,
    initialSearch.date && `${a.date}: ${formatDisplayDate(initialSearch.date, locale)}`,
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
              'url("https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Kinshasa_Gombe_%28cropped%29.jpg/1280px-Kinshasa_Gombe_%28cropped%29.jpg")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2744] via-[#0f2744]/90 to-[#0f2744]/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav
            className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-white">
              {a.breadcrumbHome}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-white">{a.breadcrumbActivities}</span>
          </nav>

          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {a.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {a.heroSubtitle}
          </p>

          <p className="mt-6 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
            {searchSummary || a.browseHint}
          </p>

          <ActivitiesSearchForm initialValues={initialSearch} />
        </div>
      </section>

      <div className="sticky top-0 z-30 border-b border-atg-border bg-atg-elevated/95 shadow-sm backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm text-atg-muted">
              {a.resultsFor}{' '}
              <strong className="text-atg-fg">{displayDestination}</strong>
            </p>
            <p className="text-lg font-bold text-atg-fg">
              {loading ? '…' : listings.length} {a.activitiesFound}
            </p>
          </div>
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-atg-muted">{a.sortBy}</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              disabled={loading}
              className="min-h-[44px] rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm font-medium text-atg-fg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:border-atg-border dark:bg-atg-surface dark:text-white"
            >
              <option value="recommended">{a.sortRecommended}</option>
              <option value="price-asc">{a.sortPriceLow}</option>
              <option value="price-desc">{a.sortPriceHigh}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            <p>{a.loadError}</p>
            <button
              type="button"
              onClick={() => setFetchId((value) => value + 1)}
              className="mt-3 min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {a.retry}
            </button>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-atg-border bg-atg-elevated px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <p className="text-sm font-medium text-atg-muted">{a.loading}</p>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-atg-border bg-atg-elevated px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <h3 className="text-lg font-bold text-atg-fg">{a.noResults}</h3>
            <p className="mt-2 text-sm text-atg-muted">{a.noResultsHint}</p>
            <a
              href="#activities-search"
              className="mt-6 mr-3 inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-6 py-2 text-sm font-semibold text-atg-fg hover:border-primary dark:border-atg-border dark:text-white"
            >
              {a.modifySearch}
            </a>
            <Link
              href="/"
              className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {a.backHome}
            </Link>
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="space-y-6">
            {listings.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                t={a}
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
