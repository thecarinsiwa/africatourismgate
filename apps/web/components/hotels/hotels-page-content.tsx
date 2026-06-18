'use client';

import type { PropertyType } from '@africatourismgate/types';
import Link from 'next/link';
import {
  ListingFiltersAside,
  ListingPageBody,
  ListingPaginationBar,
  ListingSortBar,
} from '../shared/listing-patterns';
import { useEffect, useMemo, useState } from 'react';
import { searchAccommodations } from '../../lib/api/public';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { parseGuestsParam, type HotelSearchResult, type HotelTypeFilter, type HotelsSearchParams } from '../../lib/hotels/listings';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { toListingPaginationLabels, scrollListingToTop } from '../../lib/listing/pagination-labels';
import { useListingPagination } from '../../lib/listing/pagination';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { HotelCard } from './hotel-card';
import { HotelsSearchForm } from './hotels-search-form';

export type { HotelsSearchParams };

type SortKey = 'recommended' | 'price-asc' | 'price-desc';

const TYPE_FILTERS: readonly (HotelTypeFilter)[] = [
  'all',
  'hotel',
  'resort',
  'apartment',
  'villa',
  'hostel',
  'other',
];

type HotelsPageContentProps = {
  initialSearch: HotelsSearchParams;
};

export function HotelsPageContent({ initialSearch }: HotelsPageContentProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const h = t.hotels;
  const l = t.listing;

  const [sort, setSort] = useState<SortKey>('recommended');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<HotelTypeFilter>('all');
  const [results, setResults] = useState<HotelSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const destination = initialSearch.destination?.trim();
  const displayDestination = destination || h.allAfrica;
  const guests = parseGuestsParam(initialSearch.guests);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    void searchAccommodations({
      destination: destination || undefined,
      checkIn: initialSearch.checkIn,
      checkOut: initialSearch.checkOut,
      guests,
      limit: 50,
    })
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
  }, [
    destination,
    initialSearch.checkIn,
    initialSearch.checkOut,
    guests,
    fetchId,
  ]);

  const listings = useMemo(() => {
    let items = [...results];

    if (starFilter !== 'all') {
      items = items.filter(
        (item) => item.starRating != null && item.starRating >= starFilter,
      );
    }
    if (typeFilter !== 'all') {
      items = items.filter((item) => item.propertyType === typeFilter);
    }

    switch (sort) {
      case 'price-asc':
        return items.sort((a, b) => a.minPriceCents - b.minPriceCents);
      case 'price-desc':
        return items.sort((a, b) => b.minPriceCents - a.minPriceCents);
      default:
        return items;
    }
  }, [results, sort, starFilter, typeFilter]);

  const paginationResetKey = useMemo(
    () =>
      JSON.stringify({
        sort,
        starFilter,
        typeFilter,
        destination,
        checkIn: initialSearch.checkIn,
        checkOut: initialSearch.checkOut,
        guests: initialSearch.guests,
        fetchId,
      }),
    [
      sort,
      starFilter,
      typeFilter,
      destination,
      initialSearch.checkIn,
      initialSearch.checkOut,
      initialSearch.guests,
      fetchId,
    ],
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
    initialSearch.checkIn && `${h.checkIn}: ${formatDisplayDate(initialSearch.checkIn, locale)}`,
    initialSearch.checkOut && `${h.checkOut}: ${formatDisplayDate(initialSearch.checkOut, locale)}`,
    initialSearch.guests && `${h.guests}: ${initialSearch.guests}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const typeLabel = (type: HotelTypeFilter | PropertyType) => {
    if (type === 'all') return h.allTypes;
    return h.types[type];
  };

  const activeFilterCount =
    (starFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0);

  function clearFilters() {
    setStarFilter('all');
    setTypeFilter('all');
  }

  const sortOptions = [
    { value: 'recommended', label: h.sortRecommended },
    { value: 'price-asc', label: h.sortPriceLow },
    { value: 'price-desc', label: h.sortPriceHigh },
  ];

  const filterPanel = (
    <>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-atg-muted">
          {h.filterStars}
        </p>
        <div className="flex flex-wrap gap-2">
          {(['all', 5, 4, 3] as const).map((stars) => (
            <button
              key={String(stars)}
              type="button"
              disabled={loading}
              onClick={() => setStarFilter(stars)}
              className={`min-h-[36px] rounded-lg px-3 text-sm font-medium transition-colors disabled:opacity-60 ${
                starFilter === stars
                  ? 'bg-primary text-white'
                  : 'bg-atg-surface text-atg-muted hover:bg-atg-surface dark:bg-white/5 text-atg-muted dark:hover:bg-white/10'
              }`}
            >
              {stars === 'all' ? h.allStars : `${stars}+ ★`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-atg-muted">
          {h.filterType}
        </p>
        <div className="flex flex-col gap-1.5">
          {TYPE_FILTERS.map((type) => (
            <button
              key={type}
              type="button"
              disabled={loading}
              onClick={() => setTypeFilter(type)}
              className={`min-h-[40px] rounded-lg px-3 text-left text-sm font-medium transition-colors disabled:opacity-60 ${
                typeFilter === type
                  ? 'bg-primary text-white'
                  : 'text-atg-muted hover:bg-atg-surface text-atg-muted dark:hover:bg-white/5'
              }`}
            >
              {typeLabel(type)}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />

      <section className="relative overflow-hidden bg-[#1b1b2f] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              'url("https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b1b2f] via-[#1b1b2f]/90 to-[#1b1b2f]/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">
              {h.breadcrumbHome}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-white font-medium">{h.breadcrumbHotels}</span>
          </nav>

          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{h.heroTitle}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{h.heroSubtitle}</p>

          {searchSummary ? (
            <p className="mt-6 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              {searchSummary}
            </p>
          ) : null}

          <HotelsSearchForm initialValues={initialSearch} />
        </div>
      </section>

      <ListingSortBar
        resultsLine={
          <>
            {h.resultsFor}{' '}
            <strong className="text-atg-fg">{displayDestination}</strong>
          </>
        }
        countLine={
          <>
            {loading ? '…' : listings.length} {h.propertiesFound}
          </>
        }
        sortLabel={h.sortBy}
        sortValue={sort}
        sortOptions={sortOptions}
        onSortChange={(value) => setSort(value as SortKey)}
        disabled={loading}
      />

      <ListingPageBody
        notice={
          !error ? (
            <p className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-atg-muted dark:border-primary/30 dark:bg-primary/10">
              {h.previewNotice}
            </p>
          ) : undefined
        }
        error={
          error
            ? {
                message: h.loadError,
                retryLabel: h.retry,
                onRetry: () => setFetchId((k) => k + 1),
              }
            : null
        }
        loading={loading}
        loadingMessage={h.loading}
        isEmpty={!loading && !error && listings.length === 0}
        empty={{
          title: h.noResults,
          description: h.noResultsHint,
          backHomeLabel: h.backHome,
          modifySearchLabel: h.modifySearch,
          modifySearchHref: '#hotels-search',
        }}
        filters={
          <ListingFiltersAside
            title={h.filters}
            mobileToggleLabel={l.filtersToggle}
            clearFiltersLabel={l.clearFilters}
            applyFiltersLabel={l.applyFilters}
            activeFilterCount={activeFilterCount}
            onClearFilters={activeFilterCount > 0 ? clearFilters : undefined}
          >
            {filterPanel}
          </ListingFiltersAside>
        }
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
        {pageItems.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            t={h}
            searchParams={{
              checkIn: initialSearch.checkIn,
              checkOut: initialSearch.checkOut,
              guests: initialSearch.guests,
            }}
          />
        ))}
      </ListingPageBody>

      <HomeFooter />
    </div>
  );
}
