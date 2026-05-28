'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { useTranslations } from '../../lib/i18n/locale-provider';
import type { HotelListing, HotelType } from '../../lib/hotels/types';
import { HotelCard } from './hotel-card';

export type HotelsSearchParams = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
};

type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'rating';

type HotelsPageContentProps = {
  initialSearch: HotelsSearchParams;
  initialListings: HotelListing[];
};

export function HotelsPageContent({ initialSearch, initialListings }: HotelsPageContentProps) {
  const t = useTranslations();
  const h = t.hotels;

  const [sort, setSort] = useState<SortKey>('recommended');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<HotelType | 'all'>('all');

  const destination = initialSearch.destination?.trim();
  const displayDestination = destination || h.allAfrica;

  const listings = useMemo(() => {
    let items = [...initialListings];

    if (starFilter !== 'all') items = items.filter((item) => item.stars >= starFilter);
    if (typeFilter !== 'all') items = items.filter((item) => item.type === typeFilter);

    switch (sort) {
      case 'price-asc':
        return items.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return items.sort((a, b) => b.price - a.price);
      case 'rating':
        return items.sort((a, b) => b.rating - a.rating);
      default:
        return items.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
    }
  }, [initialListings, sort, starFilter, typeFilter]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <section className="relative overflow-hidden bg-[#1b1b2f] text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b1b2f] via-[#1b1b2f]/90 to-[#1b1b2f]/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">{h.breadcrumbHome}</Link>
            <span aria-hidden>/</span>
            <span className="text-white font-medium">{h.breadcrumbHotels}</span>
          </nav>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{h.heroTitle}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{h.heroSubtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/" className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover">{h.modifySearch}</Link>
          </div>
        </div>
      </section>

      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm text-gray-500 dark:text-atg-muted">{h.resultsFor} <strong className="text-[#0f1a16] dark:text-white">{displayDestination}</strong></p>
            <p className="text-lg font-bold text-[#0f1a16] dark:text-white">{listings.length} {h.propertiesFound}</p>
          </div>
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-atg-muted">{h.sortBy}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="min-h-[44px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-white">
              <option value="recommended">{h.sortRecommended}</option>
              <option value="price-asc">{h.sortPriceLow}</option>
              <option value="price-desc">{h.sortPriceHigh}</option>
              <option value="rating">{h.sortRating}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-64 lg:shrink-0">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-atg-border dark:bg-atg-elevated">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#0f1a16] dark:text-white">{h.filters}</h2>
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-atg-muted">{h.filterStars}</p>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 5, 4, 3] as const).map((stars) => (
                      <button key={String(stars)} type="button" onClick={() => setStarFilter(stars)} className={`min-h-[36px] rounded-lg px-3 text-sm font-medium transition-colors ${starFilter === stars ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:text-atg-muted dark:hover:bg-white/10'}`}>
                        {stars === 'all' ? h.allStars : `${stars}+ ?`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-atg-muted">{h.filterType}</p>
                  <div className="flex flex-col gap-1.5">
                    {(['all', 'hotel', 'resort', 'lodge', 'riad'] as const).map((type) => (
                      <button key={type} type="button" onClick={() => setTypeFilter(type)} className={`min-h-[40px] rounded-lg px-3 text-left text-sm font-medium transition-colors ${typeFilter === type ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-atg-muted dark:hover:bg-white/5'}`}>
                        {type === 'all' ? h.allTypes : h.types[type]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-6">
            {listings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
                <h3 className="mt-4 text-lg font-bold text-[#0f1a16] dark:text-white">{h.noResults}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-atg-muted">{h.noResultsHint}</p>
                <Link href="/" className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover">{h.backHome}</Link>
              </div>
            ) : (
              listings.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} t={h} />)
            )}
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  );
}