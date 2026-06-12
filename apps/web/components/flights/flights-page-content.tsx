'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { searchFlights } from '../../lib/api/public';
import { formatAirportLabel } from '../../lib/flights/airports';
import {
  parsePassengersParam,
  toFlightSearchQuery,
  type FlightsSearchParams,
} from '../../lib/flights/listings';
import { usePublicAirports } from '../../lib/flights/use-public-airports';
import type { FlightSearchResult } from '../../lib/flights/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { FlightCard } from './flight-card';

export type { FlightsSearchParams };

type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'duration';

type FlightsPageContentProps = {
  initialSearch: FlightsSearchParams;
};

export function FlightsPageContent({ initialSearch }: FlightsPageContentProps) {
  const t = useTranslations();
  const f = t.flights;
  const { locale } = useLocale();
  const { airports } = usePublicAirports();

  const [sort, setSort] = useState<SortKey>('recommended');
  const [results, setResults] = useState<FlightSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const apiQuery = useMemo(() => toFlightSearchQuery(initialSearch), [initialSearch]);
  const passengers = parsePassengersParam(initialSearch.passengers);

  const displayRoute =
    initialSearch.from && initialSearch.to
      ? `${formatAirportLabel(initialSearch.from, airports)} → ${formatAirportLabel(initialSearch.to, airports)}`
      : f.anyRoute;

  useEffect(() => {
    let cancelled = false;
    if (!apiQuery) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    void searchFlights(apiQuery)
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
      case 'duration':
        return items.sort((a, b) => a.durationMinutes - b.durationMinutes);
      default:
        return items;
    }
  }, [results, sort]);

  const searchSummary = [
    initialSearch.returnDate ? t.search.roundTrip : t.search.oneWay,
    initialSearch.departureDate &&
      `${f.departureDate}: ${formatDisplayDate(initialSearch.departureDate, locale)}`,
    initialSearch.returnDate &&
      `${f.returnDate}: ${formatDisplayDate(initialSearch.returnDate, locale)}`,
    `${f.passengers}: ${passengers}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const detailSearchParams = {
    from: initialSearch.from,
    to: initialSearch.to,
    departureDate: initialSearch.departureDate,
    returnDate: initialSearch.returnDate,
    passengers: String(passengers),
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />

      <section className="relative overflow-hidden bg-[#1b1b2f] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              'url("https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Clouds_from_above_%28Unsplash%29.jpg/1280px-Clouds_from_above_%28Unsplash%29.jpg")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b1b2f] via-[#1b1b2f]/90 to-[#1b1b2f]/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav
            className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-white">
              {f.breadcrumbHome}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-white">{f.breadcrumbFlights}</span>
          </nav>

          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {f.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {f.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/#search"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
            >
              {f.modifySearch}
            </Link>
            {searchSummary && (
              <p className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                {searchSummary}
              </p>
            )}
          </div>
        </div>
      </section>

      {apiQuery && (
        <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="text-sm text-gray-500 dark:text-atg-muted">
                {f.resultsFor}{' '}
                <strong className="text-[#0f1a16] dark:text-white">{displayRoute}</strong>
              </p>
              <p className="text-lg font-bold text-[#0f1a16] dark:text-white">
                {loading ? '…' : listings.length} {f.flightsFound}
              </p>
            </div>
            <label className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-atg-muted">
                {f.sortBy}
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                disabled={loading}
                className="min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:border-atg-border dark:bg-atg-surface dark:text-white"
              >
                <option value="recommended">{f.sortRecommended}</option>
                <option value="price-asc">{f.sortPriceLow}</option>
                <option value="price-desc">{f.sortPriceHigh}</option>
                <option value="duration">{f.sortDuration}</option>
              </select>
            </label>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {!apiQuery && (
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <h3 className="mt-4 text-lg font-bold text-[#0f1a16] dark:text-white">
              {f.noSearchParams}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-atg-muted">{f.noSearchParamsHint}</p>
            <Link
              href="/#search"
              className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {f.startSearch}
            </Link>
          </div>
        )}

        {apiQuery && error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            <p>{f.loadError}</p>
            <button
              type="button"
              onClick={() => setFetchId((value) => value + 1)}
              className="mt-3 min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {f.retry}
            </button>
          </div>
        )}

        {apiQuery && loading && (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <p className="text-sm font-medium text-gray-600 dark:text-atg-muted">{f.loading}</p>
          </div>
        )}

        {apiQuery && !loading && !error && listings.length === 0 && (
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <h3 className="mt-4 text-lg font-bold text-[#0f1a16] dark:text-white">{f.noResults}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-atg-muted">{f.noResultsHint}</p>
            <Link
              href="/"
              className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {f.backHome}
            </Link>
          </div>
        )}

        {apiQuery && !loading && !error && listings.length > 0 && (
          <div className="space-y-6">
            {listings.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                t={f}
                searchParams={detailSearchParams}
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
