'use client';

import type { PublicActivityProviderListItem } from '@africatourismgate/types';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { listPublicActivityProviders } from '../../lib/api/public';
import { usePersistentState } from '../../lib/hooks/use-persistent-state';
import { useListingPagination } from '../../lib/listing/pagination';
import { toListingPaginationLabels, scrollListingToTop } from '../../lib/listing/pagination-labels';
import { partnerColor, partnerInitials } from '../../lib/partners/display';
import { partnerHref } from '../../lib/partners/listings';
import {
  DEFAULT_PARTNERS_VIEW_MODE,
  PARTNERS_VIEW_MODE_STORAGE_KEY,
  isPartnersSortKey,
  isPartnersViewMode,
  sortPartners,
  type PartnersSortKey,
  type PartnersViewMode,
} from '../../lib/partners/view-mode';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { StarRating } from '../shared';
import { ListingPageBody, ListingPaginationBar, ListingSortBar } from '../shared/listing-patterns';
import { PageHero } from '../shared/page-hero';
import {
  GridViewIcon,
  ListViewIcon,
  TableViewIcon,
  ViewModeToggle,
} from '../shared/view-mode-toggle';

type Partner = PublicActivityProviderListItem;
type Translate = ReturnType<typeof useTranslations<'partners'>>;

function countryName(code: string | null | undefined, locale: string): string | null {
  if (!code) return null;
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

function PartnerLogo({ partner, size }: { partner: Partner; size: 'sm' | 'lg' }) {
  const logo = partner.logoUrl?.trim() ? normalizeBrandingAssetUrl(partner.logoUrl.trim()) : null;
  const box =
    size === 'lg' ? 'h-20 w-20 sm:h-24 sm:w-24 text-xl sm:text-2xl' : 'h-12 w-12 text-sm';
  if (logo) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-atg-border/60 ${box}`}
      >
        <Image
          src={logo}
          alt=""
          fill
          unoptimized
          className="object-cover"
          sizes={size === 'lg' ? '96px' : '48px'}
        />
      </div>
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm ${box}`}
      style={{ backgroundColor: partnerColor(partner.name) }}
      aria-hidden
    >
      {partnerInitials(partner.name)}
    </div>
  );
}

function PartnerRating({ partner, t }: { partner: Partner; t: Translate }) {
  if (partner.averageRating == null || !partner.reviewCount) {
    return <span className="text-sm text-atg-muted">{t('noRating')}</span>;
  }
  const rating = partner.averageRating.toFixed(1);
  return (
    <span className="inline-flex items-center gap-2 text-sm text-atg-fg">
      <StarRating
        value={partner.averageRating}
        size="sm"
        ariaLabel={t('ratingAria', { rating })}
      />
      {t('ratingSummary', { rating, count: partner.reviewCount })}
    </span>
  );
}

function partnerSummary(partner: Partner, t: Translate, locale: string): string {
  const parts = [t('activitiesCount', { count: partner.activitiesCount ?? 0 })];
  const place = [partner.destinationName, countryName(partner.countryCode, locale)]
    .filter(Boolean)
    .join(', ');
  if (place) parts.push(place);
  return parts.join(' · ');
}

const viewButtonClass =
  'inline-flex min-h-[40px] items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface';

function PartnersGrid({ partners, t, locale }: { partners: Partner[]; t: Translate; locale: string }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {partners.map((partner) => (
        <li
          key={partner.id}
          className="flex flex-col items-center gap-3 rounded-2xl border border-atg-border bg-atg-elevated p-6 text-center shadow-sm transition-shadow hover:shadow-md dark:border-atg-border dark:bg-atg-elevated"
        >
          <PartnerLogo partner={partner} size="lg" />
          <h2 className="line-clamp-2 text-base font-semibold text-atg-fg">{partner.name}</h2>
          <p className="line-clamp-2 text-sm text-atg-muted">{partnerSummary(partner, t, locale)}</p>
          <PartnerRating partner={partner} t={t} />
          <Link
            href={partnerHref(partner.id)}
            className={`${viewButtonClass} mt-auto w-full`}
            aria-label={t('viewPartnerAria', { name: partner.name })}
          >
            {t('view')}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PartnersList({ partners, t, locale }: { partners: Partner[]; t: Translate; locale: string }) {
  return (
    <ul className="flex flex-col gap-4">
      {partners.map((partner) => (
        <li
          key={partner.id}
          className="flex flex-col gap-4 rounded-2xl border border-atg-border bg-atg-elevated p-4 shadow-sm sm:flex-row sm:items-center dark:border-atg-border dark:bg-atg-elevated"
        >
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <PartnerLogo partner={partner} size="sm" />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold text-atg-fg">{partner.name}</h2>
              <p className="text-sm text-atg-muted">{partnerSummary(partner, t, locale)}</p>
              <div className="mt-1">
                <PartnerRating partner={partner} t={t} />
              </div>
            </div>
          </div>
          <Link
            href={partnerHref(partner.id)}
            className={`${viewButtonClass} w-full sm:w-auto`}
            aria-label={t('viewPartnerAria', { name: partner.name })}
          >
            {t('view')}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PartnersTable({ partners, t, locale }: { partners: Partner[]; t: Translate; locale: string }) {
  const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-atg-muted';
  const td = 'px-4 py-3 align-middle text-sm text-atg-fg';
  return (
    <div className="overflow-x-auto rounded-2xl border border-atg-border bg-atg-elevated shadow-sm dark:border-atg-border dark:bg-atg-elevated">
      <table className="min-w-[720px] w-full divide-y divide-atg-border">
        <caption className="sr-only">{t('tableCaption')}</caption>
        <thead>
          <tr>
            <th scope="col" className={th}>{t('tableName')}</th>
            <th scope="col" className={th}>{t('destinationLabel')}</th>
            <th scope="col" className={th}>{t('tableCountry')}</th>
            <th scope="col" className={th}>{t('tableActivities')}</th>
            <th scope="col" className={th}>{t('tableRating')}</th>
            <th scope="col" className={`${th} text-right`}>{t('tableActions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-atg-border">
          {partners.map((partner) => (
            <tr key={partner.id} className="transition-colors hover:bg-primary/5">
              <th scope="row" className={`${td} font-semibold`}>
                <div className="flex items-center gap-3">
                  <PartnerLogo partner={partner} size="sm" />
                  <span>{partner.name}</span>
                </div>
              </th>
              <td className={td}>{partner.destinationName ?? '—'}</td>
              <td className={td}>{countryName(partner.countryCode, locale) ?? '—'}</td>
              <td className={td}>{partner.activitiesCount ?? 0}</td>
              <td className={td}>
                <PartnerRating partner={partner} t={t} />
              </td>
              <td className={`${td} text-right`}>
                <Link
                  href={partnerHref(partner.id)}
                  className={viewButtonClass}
                  aria-label={t('viewPartnerAria', { name: partner.name })}
                >
                  {t('view')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PartnersPageContent() {
  const t = useTranslations('partners');
  const tListing = useTranslations('listing');
  const locale = useLocale();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);
  const [sort, setSort] = useState<PartnersSortKey>('name-asc');
  const [viewMode, setViewMode] = usePersistentState<PartnersViewMode>(
    PARTNERS_VIEW_MODE_STORAGE_KEY,
    DEFAULT_PARTNERS_VIEW_MODE,
    isPartnersViewMode,
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    void listPublicActivityProviders()
      .then((rows) => {
        if (!cancelled) setPartners(rows);
      })
      .catch(() => {
        if (!cancelled) {
          setPartners([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchId]);

  const sorted = useMemo(() => sortPartners(partners, sort), [partners, sort]);
  const paginationResetKey = useMemo(() => `${fetchId}:${sort}`, [fetchId, sort]);

  const {
    pageItems,
    page,
    setPage,
    totalPages,
    totalItems,
    pageSize,
    showPagination,
  } = useListingPagination(sorted, paginationResetKey);

  const paginationLabels = useMemo(() => toListingPaginationLabels(tListing), [tListing]);

  const sortOptions = useMemo(
    () => [
      { value: 'name-asc', label: t('sortNameAsc') },
      { value: 'name-desc', label: t('sortNameDesc') },
      { value: 'activities', label: t('sortActivities') },
      { value: 'rating', label: t('sortRating') },
    ],
    [t],
  );

  const viewOptions = useMemo(
    () => [
      { value: 'grid' as const, label: t('viewGrid'), icon: <GridViewIcon /> },
      { value: 'list' as const, label: t('viewList'), icon: <ListViewIcon /> },
      {
        value: 'table' as const,
        label: t('viewTable'),
        icon: <TableViewIcon />,
        className: 'hidden md:inline-flex',
      },
    ],
    [t],
  );

  return (
    <div className="flex min-h-screen flex-col bg-atg-bg text-atg-fg">
      <HomeHeader />
      <main className="flex-1">
        <PageHero
          title={
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('heroTitle')}</h1>
          }
          description={
            <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              {t('heroSubtitle')}
            </p>
          }
        />
        <ListingSortBar
          resultsLine={t('resultsLine')}
          countLine={t('countLine', { count: partners.length })}
          sortLabel={t('sortLabel')}
          sortValue={sort}
          sortOptions={sortOptions}
          onSortChange={(value) => {
            if (isPartnersSortKey(value)) setSort(value);
          }}
          disabled={loading || partners.length === 0}
          actions={
            <ViewModeToggle
              value={viewMode}
              options={viewOptions}
              onChange={setViewMode}
              ariaLabel={t('viewModeLabel')}
            />
          }
        />
        <ListingPageBody
          loading={loading}
          loadingMessage={t('loading')}
          error={
            error
              ? {
                  message: t('loadError'),
                  retryLabel: t('retry'),
                  onRetry: () => setFetchId((n) => n + 1),
                }
              : null
          }
          isEmpty={partners.length === 0}
          empty={{
            title: t('noResults'),
            description: t('noResultsHint'),
            backHomeLabel: t('breadcrumbHome'),
          }}
          pagination={
            showPagination ? (
              <ListingPaginationBar
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                itemLabel={t('resultItem')}
                labels={paginationLabels}
                onPageChange={(next) => {
                  setPage(next);
                  scrollListingToTop();
                }}
              />
            ) : null
          }
        >
          <div data-view-mode={viewMode}>
            {viewMode === 'grid' ? <PartnersGrid partners={pageItems} t={t} locale={locale} /> : null}
            {viewMode === 'list' ? <PartnersList partners={pageItems} t={t} locale={locale} /> : null}
            {viewMode === 'table' ? (
              <>
                <div className="md:hidden">
                  <PartnersList partners={pageItems} t={t} locale={locale} />
                </div>
                <div className="hidden md:block">
                  <PartnersTable partners={pageItems} t={t} locale={locale} />
                </div>
              </>
            ) : null}
          </div>
        </ListingPageBody>
      </main>
      <HomeFooter />
    </div>
  );
}
