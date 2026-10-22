'use client';

import type { PublicActivityProviderDetail } from '@africatourismgate/types';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getPublicActivityProvider } from '../../lib/api/public';
import type { ActivitySearchResult } from '../../lib/activities/types';
import { useNamespaceLabels } from '../../lib/i18n/use-namespace-labels';
import { useListingPagination } from '../../lib/listing/pagination';
import { scrollListingToTop, toListingPaginationLabels } from '../../lib/listing/pagination-labels';
import { partnerColor, partnerInitials } from '../../lib/partners/display';
import { partnersListHref } from '../../lib/partners/listings';
import { siteSearchDeepLinks } from '../../lib/site-search/deep-links';
import { ActivityCard } from '../activities/activity-card';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { StarRating } from '../shared';
import { ListingPageBody, ListingPaginationBar, ListingSortBar } from '../shared/listing-patterns';

type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'rating';

type PartnerDetailPageContentProps = {
  partnerId: string;
};

function PartnerLogo({ name, logo }: { name: string; logo: string | null }) {
  const frame =
    'relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(0,0,0,.35)] ring-4 ring-white/90 sm:h-24 sm:w-24';
  if (logo) {
    return (
      <div className={frame}>
        <Image src={logo} alt={name} fill unoptimized className="object-contain p-2" sizes="96px" priority />
      </div>
    );
  }
  return (
    <div
      className={`${frame} flex items-center justify-center text-2xl font-bold text-white sm:text-3xl`}
      style={{ backgroundColor: partnerColor(name) }}
      aria-hidden
    >
      {partnerInitials(name)}
    </div>
  );
}

/** Weighted average over activities that have reviews. */
function aggregateRating(activities: PublicActivityProviderDetail['activities']) {
  let weighted = 0;
  let count = 0;
  for (const activity of activities) {
    const n = activity.reviewCount ?? 0;
    if (n > 0 && activity.averageRating != null) {
      weighted += activity.averageRating * n;
      count += n;
    }
  }
  return count > 0 ? { rating: weighted / count, count } : null;
}

export function PartnerDetailPageContent({ partnerId }: PartnerDetailPageContentProps) {
  const t = useTranslations('partners');
  const tListing = useTranslations('listing');
  const a = useNamespaceLabels('activities');
  const locale = useLocale();

  const [detail, setDetail] = useState<PublicActivityProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);
  const [sort, setSort] = useState<SortKey>('recommended');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setError(false);

    void getPublicActivityProvider(partnerId)
      .then((row) => {
        if (!cancelled) setDetail(row);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDetail(null);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('404')) {
          setNotFound(true);
        } else {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [partnerId, fetchId]);

  const logo = detail?.logoUrl?.trim() ? normalizeBrandingAssetUrl(detail.logoUrl.trim()) : null;

  const heroImage = useMemo(
    () => detail?.activities.find((row) => row.imageUrl?.trim())?.imageUrl?.trim() ?? null,
    [detail],
  );

  const rating = useMemo(() => (detail ? aggregateRating(detail.activities) : null), [detail]);

  const listings = useMemo(() => {
    const items = [...(detail?.activities ?? [])];
    switch (sort) {
      case 'price-asc':
        return items.sort((x, y) => x.priceCents - y.priceCents);
      case 'price-desc':
        return items.sort((x, y) => y.priceCents - x.priceCents);
      case 'rating':
        return items.sort((x, y) => (y.averageRating ?? 0) - (x.averageRating ?? 0));
      default:
        return items;
    }
  }, [detail, sort]);

  const paginationResetKey = useMemo(
    () => JSON.stringify({ sort, partnerId, fetchId }),
    [sort, partnerId, fetchId],
  );
  const { pageItems, page, setPage, totalPages, totalItems, pageSize, showPagination } =
    useListingPagination(listings, paginationResetKey);
  const paginationLabels = useMemo(() => toListingPaginationLabels(tListing), [tListing]);

  const destinationHref = detail
    ? siteSearchDeepLinks.activitiesByDestination(detail.destinationName)
    : '#';

  const heroTitle = detail?.name ?? (notFound ? t('notFoundTitle') : error ? t('loadError') : null);

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />

      <section className="relative overflow-hidden bg-[#1b1b2f] text-white">
        {heroImage ? (
          <Image
            src={heroImage}
            alt=""
            fill
            unoptimized
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
        ) : (
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(11,110,79,.4),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(26,158,215,.2),_transparent_45%)]"
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b1b2f] via-[#1b1b2f]/90 to-[#1b1b2f]/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav
            className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-white">
              {t('breadcrumbHome')}
            </Link>
            <span aria-hidden>/</span>
            <Link href={partnersListHref()} className="transition-colors hover:text-white">
              {t('breadcrumbPartners')}
            </Link>
            {detail ? (
              <>
                <span aria-hidden>/</span>
                <span className="max-w-[14rem] truncate font-medium text-white sm:max-w-none">
                  {detail.name}
                </span>
              </>
            ) : null}
          </nav>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            {detail ? <PartnerLogo name={detail.name} logo={logo} /> : null}
            {loading ? (
              <div className="h-20 w-20 animate-pulse rounded-2xl bg-white/10 sm:h-24 sm:w-24" />
            ) : null}

            <div className="min-w-0 flex-1">
              {detail ? (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/90">
                  {t('operatorBadge')}
                </p>
              ) : null}
              {heroTitle ? (
                <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {heroTitle}
                </h1>
              ) : (
                <div className="h-10 w-2/3 max-w-md animate-pulse rounded bg-white/15" />
              )}
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                {detail
                  ? t('detailIntro', { destination: detail.destinationName })
                  : notFound
                    ? t('notFoundDescription')
                    : null}
              </p>
            </div>
          </div>

          {detail ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={destinationHref}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm transition hover:bg-white/15"
              >
                <svg
                  className="h-4 w-4 shrink-0 text-emerald-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                {detail.destinationName}
              </Link>
              <span className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                {t('activitiesCount', { count: detail.activities.length })}
              </span>
              {rating ? (
                <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                  <StarRating
                    value={rating.rating}
                    size="sm"
                    ariaLabel={a.ratingAria.replace('{rating}', rating.rating.toFixed(1))}
                  />
                  {t('ratingSummary', {
                    rating: rating.rating.toFixed(1),
                    count: rating.count,
                  })}
                </span>
              ) : null}
              <Link
                href={partnersListHref()}
                className="inline-flex items-center rounded-lg border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t('backToPartners')}
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {detail ? (
        <ListingSortBar
          resultsLine={
            <>
              {t('offeredBy')} <strong className="text-atg-fg">{detail.name}</strong>
            </>
          }
          countLine={
            <>
              {listings.length} {a.activitiesFound}
            </>
          }
          sortLabel={a.sortBy}
          sortValue={sort}
          sortOptions={[
            { value: 'recommended', label: a.sortRecommended },
            { value: 'price-asc', label: a.sortPriceLow },
            { value: 'price-desc', label: a.sortPriceHigh },
            { value: 'rating', label: t('sortRating') },
          ]}
          onSortChange={(value) => setSort(value as SortKey)}
        />
      ) : null}

      <ListingPageBody
        error={
          error
            ? {
                message: t('loadError'),
                retryLabel: t('retry'),
                onRetry: () => setFetchId((value) => value + 1),
                backHomeLabel: t('backToPartners'),
                backHomeHref: partnersListHref(),
              }
            : null
        }
        loading={loading}
        loadingMessage={a.loading}
        isEmpty={!loading && !error && listings.length === 0}
        empty={
          notFound
            ? {
                title: t('notFoundTitle'),
                description: t('notFoundDescription'),
                backHomeLabel: t('backToPartners'),
                backHomeHref: partnersListHref(),
              }
            : {
                title: t('noActivities'),
                description: t('noActivitiesHint'),
                backHomeLabel: t('backToPartners'),
                backHomeHref: partnersListHref(),
              }
        }
        pagination={
          showPagination ? (
            <ListingPaginationBar
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              itemLabel={tListing('resultItem')}
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
            activity={activity as ActivitySearchResult}
            t={a}
            searchParams={{ destination: detail?.destinationName }}
            locale={locale}
          />
        ))}
      </ListingPageBody>

      {detail && listings.length > 0 ? (
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3 border-t border-atg-border pt-8 text-center">
            <p className="text-sm text-atg-muted">{t('moreInDestination')}</p>
            <Link
              href={destinationHref}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-5 py-2 text-sm font-semibold text-atg-fg transition-colors hover:border-primary hover:text-primary dark:text-white/80"
            >
              {t('browseDestinationActivities', { destination: detail.destinationName })}
            </Link>
          </div>
        </div>
      ) : null}

      <HomeFooter />
    </div>
  );
}
