'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { browsePackages } from '../../lib/api/public';
import {
  formatPackagePrice,
  hasPackageDiscount,
  buildPackageDetailHref,
  toPackagesBrowseQuery,
  type PackagesSearchParams,
} from '../../lib/packages/listings';
import type { PackageListItem } from '../../lib/packages/types';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { ListingPageBody, ListingPaginationBar, ListingSortBar } from '../shared/listing-patterns';
import { PackageCard } from './package-card';
import { PackagesSearchForm } from './packages-search-form';
import { toListingPaginationLabels, scrollListingToTop } from '../../lib/listing/pagination-labels';
import { useListingPagination } from '../../lib/listing/pagination';
import { PackagePriceDisplay } from './package-price-display';
import { useBookingCtaLabel } from '../../lib/bookings/use-booking-cta';
import Image from 'next/image';

export type { PackagesSearchParams };

type SortKey = 'recommended' | 'price-asc' | 'price-desc';
type ViewMode = 'cards' | 'list' | 'compact';

type PackagesPageContentProps = {
  initialSearch: PackagesSearchParams;
};

export function PackagesPageContent({ initialSearch }: PackagesPageContentProps) {
  const t = useTranslations();
  const p = t.packages;
  const l = t.listing;
  const ctaLabel = useBookingCtaLabel('package');

  const [sort, setSort] = useState<SortKey>('recommended');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [results, setResults] = useState<PackageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const browseQuery = useMemo(
    () => toPackagesBrowseQuery(initialSearch),
    [initialSearch],
  );

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(false);

    void browsePackages(browseQuery)
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
  }, [browseQuery, fetchId]);

  const listings = useMemo(() => {
    const items = [...results];
    switch (sort) {
      case 'price-asc':
        return items.sort((a, b) => a.pricing.totalCents - b.pricing.totalCents);
      case 'price-desc':
        return items.sort((a, b) => b.pricing.totalCents - a.pricing.totalCents);
      default:
        return items;
    }
  }, [results, sort]);

  const paginationResetKey = useMemo(
    () => JSON.stringify({ sort, browseQuery, fetchId }),
    [sort, browseQuery, fetchId],
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

  const searchSummary = initialSearch.search
    ? `${p.searchLabel}: ${initialSearch.search}`
    : p.browseHint;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('packages:viewMode');
    if (saved === 'cards' || saved === 'list' || saved === 'compact') {
      setViewMode(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('packages:viewMode', viewMode);
  }, [viewMode]);

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />

      <section className="relative overflow-hidden bg-[#0f2744] text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2744] via-[#0f2744]/95 to-primary/40" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav
            className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-white">
              {p.breadcrumbHome}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-white">{p.breadcrumbPackages}</span>
          </nav>

          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {p.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {p.heroSubtitle}
          </p>

          <p className="mt-6 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
            {searchSummary}
          </p>

          <PackagesSearchForm initialValues={initialSearch} />
        </div>
      </section>

      <ListingSortBar
        resultsLine={p.resultsFor}
        countLine={
          <>
            {loading ? '…' : listings.length} {p.packagesFound}
          </>
        }
        sortLabel={p.sortBy}
        sortValue={sort}
        sortOptions={[
          { value: 'recommended', label: p.sortRecommended },
          { value: 'price-asc', label: p.sortPriceLow },
          { value: 'price-desc', label: p.sortPriceHigh },
        ]}
        onSortChange={(value) => setSort(value as SortKey)}
        disabled={loading}
      />

      <section className="border-b border-atg-border bg-atg-elevated dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <span className="text-sm font-medium text-atg-muted">{p.displayModeLabel}</span>
          {(
            [
              ['cards', p.displayModeCards],
              ['list', p.displayModeList],
              ['compact', p.displayModeCompact],
            ] as Array<[ViewMode, string]>
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                viewMode === mode
                  ? 'border-primary bg-primary/10 font-semibold text-primary'
                  : 'border-atg-border text-atg-muted hover:border-primary/50 hover:text-atg-fg'
              }`}
              aria-pressed={viewMode === mode}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <ListingPageBody
        error={
          error
            ? {
                message: p.loadError,
                retryLabel: p.retry,
                onRetry: () => setFetchId((value) => value + 1),
              }
            : null
        }
        loading={loading}
        loadingMessage={p.loading}
        isEmpty={!loading && !error && listings.length === 0}
        empty={{
          title: p.noResults,
          description: p.noResultsHint,
          backHomeLabel: p.backHome,
          modifySearchLabel: p.modifySearch,
          modifySearchHref: '#packages-search',
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
        {viewMode === 'cards'
          ? pageItems.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} t={p} searchParams={initialSearch} />
            ))
          : null}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {pageItems.map((pkg) => {
              const detailHref = buildPackageDetailHref(pkg.id, initialSearch);
              const reserveHref = buildPackageDetailHref(pkg.id, initialSearch, '#configure');
              return (
                <article
                  key={pkg.id}
                  className="grid gap-4 rounded-2xl border border-atg-border bg-atg-elevated p-4 sm:grid-cols-[200px_minmax(0,1fr)_auto] sm:items-center dark:border-atg-border dark:bg-atg-elevated"
                >
                  <div className="relative h-36 overflow-hidden rounded-xl bg-atg-surface">
                    {pkg.imageUrl ? (
                      <Image src={pkg.imageUrl} alt={pkg.name} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 space-y-2">
                    <h3 className="break-words text-lg font-bold text-atg-fg">{pkg.name}</h3>
                    {pkg.description ? (
                      <p className="line-clamp-3 text-sm text-atg-muted">
                        {pkg.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
                      </p>
                    ) : null}
                    <p className="text-sm font-medium text-primary">
                      {p.itemsIncluded.replace('{n}', String(pkg.itemCount))}
                    </p>
                  </div>
                  <div className="space-y-3 sm:text-right">
                    <PackagePriceDisplay
                      pricing={pkg.pricing}
                      priceLabel={p.packagePrice}
                      discountBadgeTemplate={p.discountBadge}
                    />
                    <div className="flex gap-2 sm:justify-end">
                      <Link
                        href={detailHref}
                        className="inline-flex min-h-[40px] items-center rounded-lg border border-atg-border px-3 py-2 text-sm font-semibold text-atg-fg hover:border-primary"
                      >
                        {p.viewDetails}
                      </Link>
                      <Link
                        href={reserveHref}
                        className="inline-flex min-h-[40px] items-center rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white hover:bg-primary-hover"
                      >
                        {ctaLabel}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
        {viewMode === 'compact' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((pkg) => {
              const detailHref = buildPackageDetailHref(pkg.id, initialSearch);
              return (
                <Link
                  key={pkg.id}
                  href={detailHref}
                  className="rounded-xl border border-atg-border bg-atg-elevated p-4 transition hover:border-primary/50 dark:border-atg-border dark:bg-atg-elevated"
                >
                  <p className="line-clamp-2 font-semibold text-atg-fg">{pkg.name}</p>
                  <p className="mt-1 text-sm text-atg-muted">
                    {p.itemsIncluded.replace('{n}', String(pkg.itemCount))}
                  </p>
                  <p className="mt-2 text-sm font-bold text-primary">
                    {formatPackagePrice(pkg.pricing.totalCents, pkg.pricing.currency)}
                  </p>
                  {hasPackageDiscount(pkg.pricing) ? (
                    <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                      {p.estimatedSavings.replace(
                        '{amount}',
                        formatPackagePrice(pkg.pricing.discountAmountCents, pkg.pricing.currency),
                      )}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ) : null}
      </ListingPageBody>

      <HomeFooter />
    </div>
  );
}
