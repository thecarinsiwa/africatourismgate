'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { searchVehicles } from '../../lib/api/public';
import {
  toVehicleSearchQuery,
  type CarsSearchParams,
} from '../../lib/cars/listings';
import type { VehicleSearchResult } from '../../lib/cars/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { ListingPageBody, ListingSortBar } from '../shared/listing-patterns';
import { CarCard } from './car-card';
import { CarsSearchForm } from './cars-search-form';

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
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
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

          {searchSummary && (
            <p className="mt-6 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              {searchSummary}
            </p>
          )}

          <CarsSearchForm initialValues={initialSearch} />
        </div>
      </section>

      <ListingSortBar
        resultsLine={
          <>
            {c.resultsFor}{' '}
            <strong className="text-atg-fg">{displayLocation}</strong>
          </>
        }
        countLine={
          <>
            {loading ? '…' : listings.length} {c.vehiclesFound}
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
          description: c.noResultsHint,
          backHomeLabel: c.backHome,
          modifySearchLabel: c.modifySearch,
          modifySearchHref: '#cars-search',
        }}
      >
        {!hasDateFilter && listings.length > 0 ? (
          <p className="col-span-full text-sm text-atg-muted">{c.browseAllHint}</p>
        ) : null}
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
      </ListingPageBody>

      <HomeFooter />
    </div>
  );
}
