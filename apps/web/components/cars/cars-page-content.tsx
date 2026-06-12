'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { searchVehicles } from '../../lib/api/public';
import {
  buildCarsSearchQuery,
  toVehicleSearchQuery,
  type CarsSearchParams,
} from '../../lib/cars/listings';
import type { VehicleSearchResult } from '../../lib/cars/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { CarCard } from './car-card';

export type { CarsSearchParams };

type SortKey = 'recommended' | 'price-asc' | 'price-desc';

type CarsPageContentProps = {
  initialSearch: CarsSearchParams;
};

export function CarsPageContent({ initialSearch }: CarsPageContentProps) {
  const t = useTranslations();
  const c = t.cars;
  const { locale } = useLocale();

  const [sort, setSort] = useState<SortKey>('recommended');
  const [results, setResults] = useState<VehicleSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const apiQuery = useMemo(() => toVehicleSearchQuery(initialSearch), [initialSearch]);
  const hasDateFilter = Boolean(initialSearch.pickupDate || initialSearch.returnDate);
  const displayLocation = initialSearch.pickupLocation?.trim() || c.anyLocation;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    void searchVehicles(apiQuery)
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
        return items.sort((a, b) => a.totalPriceCents - b.totalPriceCents);
      case 'price-desc':
        return items.sort((a, b) => b.totalPriceCents - a.totalPriceCents);
      default:
        return items;
    }
  }, [results, sort]);

  const searchSummary = [
    initialSearch.pickupDate &&
      `${c.pickupDate}: ${formatDisplayDate(initialSearch.pickupDate, locale)}`,
    initialSearch.returnDate &&
      `${c.returnDate}: ${formatDisplayDate(initialSearch.returnDate, locale)}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const defaultDetailSearchParams = {
    pickupLocation: initialSearch.pickupLocation,
    pickupDate: initialSearch.pickupDate,
    returnDate: initialSearch.returnDate,
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />

      <section className="relative overflow-hidden bg-[#1b1b2f] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              'url("https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Car_keys.jpg/1280px-Car_keys.jpg")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b1b2f] via-[#1b1b2f]/90 to-[#1b1b2f]/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav
            className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-white">
              {c.breadcrumbHome}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-white">{c.breadcrumbCars}</span>
          </nav>

          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {c.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {c.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/#search"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
            >
              {c.modifySearch}
            </Link>
            {searchSummary ? (
              <p className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                {searchSummary}
              </p>
            ) : (
              <p className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                {c.browseAllHint}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm text-gray-500 dark:text-atg-muted">
              {c.resultsFor}{' '}
              <strong className="text-[#0f1a16] dark:text-white">{displayLocation}</strong>
            </p>
            <p className="text-lg font-bold text-[#0f1a16] dark:text-white">
              {loading ? '…' : listings.length} {c.vehiclesFound}
            </p>
          </div>
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-atg-muted">
              {c.sortBy}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              disabled={loading}
              className="min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:border-atg-border dark:bg-atg-surface dark:text-white"
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
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <p className="text-sm font-medium text-gray-600 dark:text-atg-muted">{c.loading}</p>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <h3 className="text-lg font-bold text-[#0f1a16] dark:text-white">{c.noResults}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-atg-muted">{c.noResultsHint}</p>
            <Link
              href={`/cars${buildCarsSearchQuery(initialSearch)}`}
              className="mt-6 mr-3 inline-flex min-h-[44px] items-center rounded-lg border border-gray-200 px-6 py-2 text-sm font-semibold text-gray-700 hover:border-primary dark:border-atg-border dark:text-white"
            >
              {c.modifySearch}
            </Link>
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
            {!hasDateFilter && (
              <p className="text-sm text-gray-500 dark:text-atg-muted">{c.browseAllHint}</p>
            )}
            {listings.map((vehicle) => (
              <CarCard
                key={vehicle.id}
                vehicle={vehicle}
                t={c}
                searchParams={{
                  pickupLocation:
                    defaultDetailSearchParams.pickupLocation ?? vehicle.pickupCity,
                  pickupDate:
                    defaultDetailSearchParams.pickupDate ?? vehicle.pickupDate,
                  returnDate:
                    defaultDetailSearchParams.returnDate ?? vehicle.returnDate,
                }}
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
