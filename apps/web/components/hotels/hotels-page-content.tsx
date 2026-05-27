'use client';

import type { PropertyType } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { searchAccommodations } from '../../lib/api/public';
import { parseGuestsParam, type HotelSearchResult, type HotelTypeFilter } from '../../lib/hotels/listings';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { HotelCard } from './hotel-card';

export type HotelsSearchParams = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
};

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
  const h = t.hotels;

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

  const searchSummary = [
    initialSearch.checkIn && `${h.checkIn}: ${formatDate(initialSearch.checkIn)}`,
    initialSearch.checkOut && `${h.checkOut}: ${formatDate(initialSearch.checkOut)}`,
    initialSearch.guests && `${h.guests}: ${initialSearch.guests}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const typeLabel = (type: HotelTypeFilter | PropertyType) => {
    if (type === 'all') return h.allTypes;
    return h.types[type];
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
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

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/#search"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
            >
              {h.modifySearch}
            </Link>
            {searchSummary && (
              <p className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">{searchSummary}</p>
            )}
          </div>
        </div>
      </section>

      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm text-gray-500 dark:text-atg-muted">
              {h.resultsFor}{' '}
              <strong className="text-[#0f1a16] dark:text-white">{displayDestination}</strong>
            </p>
            <p className="text-lg font-bold text-[#0f1a16] dark:text-white">
              {loading ? '…' : listings.length} {h.propertiesFound}
            </p>
          </div>
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-atg-muted">{h.sortBy}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              disabled={loading}
              className="min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:border-atg-border dark:bg-atg-surface dark:text-white"
            >
              <option value="recommended">{h.sortRecommended}</option>
              <option value="price-asc">{h.sortPriceLow}</option>
              <option value="price-desc">{h.sortPriceHigh}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {!error && (
          <p className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-gray-600 dark:border-primary/30 dark:bg-primary/10 dark:text-atg-muted">
            {h.previewNotice}
          </p>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            <p>{h.loadError}</p>
            <button
              type="button"
              onClick={() => setFetchId((k) => k + 1)}
              className="mt-3 min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {h.retry}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-64 lg:shrink-0">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-atg-border dark:bg-atg-elevated">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#0f1a16] dark:text-white">
                {h.filters}
              </h2>

              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-atg-muted">
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
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:text-atg-muted dark:hover:bg-white/10'
                        }`}
                      >
                        {stars === 'all' ? h.allStars : `${stars}+ ★`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-atg-muted">
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
                            : 'text-gray-600 hover:bg-gray-50 dark:text-atg-muted dark:hover:bg-white/5'
                        }`}
                      >
                        {typeLabel(type)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-6">
            {loading ? (
              <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
                <p className="text-sm font-medium text-gray-600 dark:text-atg-muted">{h.loading}</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
                <svg
                  className="mx-auto h-12 w-12 text-gray-300 dark:text-atg-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-bold text-[#0f1a16] dark:text-white">{h.noResults}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-atg-muted">{h.noResultsHint}</p>
                <Link
                  href="/"
                  className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
                >
                  {h.backHome}
                </Link>
              </div>
            ) : (
              listings.map((hotel) => (
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
              ))
            )}
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
