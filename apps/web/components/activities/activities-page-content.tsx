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
import { ListingPageBody, ListingPaginationBar, ListingSortBar } from '../shared/listing-patterns';
import { ActivitiesSearchForm } from './activities-search-form';
import { ActivityCard } from './activity-card';
import { toListingPaginationLabels, scrollListingToTop } from '../../lib/listing/pagination-labels';
import { useListingPagination } from '../../lib/listing/pagination';

export type { ActivitiesSearchParams };

type SortKey = 'recommended' | 'price-asc' | 'price-desc';

type ActivitiesPageContentProps = {
  initialSearch: ActivitiesSearchParams;
};

export function ActivitiesPageContent({ initialSearch }: ActivitiesPageContentProps) {
  const t = useTranslations();
  const a = t.activities;
  const l = t.listing;
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

  const paginationResetKey = useMemo(
    () => JSON.stringify({ sort, browseQuery, searchQuery, hasDateSearch, fetchId }),
    [sort, browseQuery, searchQuery, hasDateSearch, fetchId],
  );

  const {
    pageItems,
    page,
    setPage,
    totalPages,
    totalItems,
    pageSize,
    showPagination,
  } = useListingPagination(listings, paginationResetKey);

  const paginationLabels = useMemo(() => toListingPaginationLabels(l), [l]);

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

      <ListingSortBar
        resultsLine={
          <>
            {a.resultsFor}{' '}
            <strong className="text-atg-fg">{displayDestination}</strong>
          </>
        }
        countLine={
          <>
            {loading ? '…' : listings.length} {a.activitiesFound}
          </>
        }
        sortLabel={a.sortBy}
        sortValue={sort}
        sortOptions={[
          { value: 'recommended', label: a.sortRecommended },
          { value: 'price-asc', label: a.sortPriceLow },
          { value: 'price-desc', label: a.sortPriceHigh },
        ]}
        onSortChange={(value) => setSort(value as SortKey)}
        disabled={loading}
      />

      <ListingPageBody
        error={
          error
            ? {
                message: a.loadError,
                retryLabel: a.retry,
                onRetry: () => setFetchId((value) => value + 1),
              }
            : null
        }
        loading={loading}
        loadingMessage={a.loading}
        isEmpty={!loading && !error && listings.length === 0}
        empty={{
          title: a.noResults,
          description: a.noResultsHint,
          backHomeLabel: a.backHome,
          modifySearchLabel: a.modifySearch,
          modifySearchHref: '#activities-search',
        }}
        pagination={
          showPagination ? (
            <ListingPaginationBar
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              itemLabel={l.resultItem}
              labels={paginationLabels}
              onPageChange={(next) => {
                setPage(next);
                scrollListingToTop();
              }}
            />
          ) : undefined
        }
      >
        {pageItems.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            t={a}
            searchParams={initialSearch}
            locale={locale}
          />
        ))}
      </ListingPageBody>

      <HomeFooter />
    </div>
  );
}
