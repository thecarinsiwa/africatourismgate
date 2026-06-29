'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCruiseSailingDetail } from '../../lib/api/public';
import {
  buildCruiseDetailHref,
  buildCruisesSearchQuery,
  parseGuestsParam,
  toCruiseSailingDetailQuery,
  type CruiseDetailSearchParams,
} from '../../lib/cruises/listings';
import { formatCruisePortLabel } from '../../lib/cruises/ports';
import type { CruiseSailingDetail } from '../../lib/cruises/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { buildReservationQuery } from '../../lib/reservations/flow';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { DetailPageSkeletonShell } from '../shared/loading-skeletons';
import { ProductGallery } from '../shared';
import { CruiseBookingMobileBar, CruiseBookingSidebar } from './cruise-booking-sidebar';
import { CruiseCabinsSection } from './cruise-cabins-section';
import { CruiseItinerarySection } from './cruise-itinerary-section';

export type CruiseDetailPageSearch = CruiseDetailSearchParams;

type CruiseDetailPageContentProps = {
  sailingId: string;
  initialSearch: CruiseDetailPageSearch;
};

export function CruiseDetailPageContent({
  sailingId,
  initialSearch,
}: CruiseDetailPageContentProps) {
  const t = useTranslations();
  const c = t.cruises;
  const { locale } = useLocale();
  const router = useRouter();

  const [detail, setDetail] = useState<CruiseSailingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const [guests, setGuests] = useState(parseGuestsParam(initialSearch.guests));
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState<string | null>(
    initialSearch.cabinId ?? null,
  );

  const searchContext = useMemo(
    (): CruiseDetailSearchParams => ({
      sailFrom: initialSearch.sailFrom,
      sailTo: initialSearch.sailTo,
      startDate: initialSearch.startDate,
      endDate: initialSearch.endDate,
      guests: String(guests),
      cabinId: selectedAvailabilityId ?? undefined,
    }),
    [initialSearch, guests, selectedAvailabilityId],
  );

  const apiQuery = useMemo(
    () => toCruiseSailingDetailQuery(searchContext),
    [searchContext],
  );

  const syncUrl = useCallback(
    (overrides: Partial<CruiseDetailPageSearch> = {}) => {
      const href = buildCruiseDetailHref(sailingId, {
        sailFrom: initialSearch.sailFrom,
        sailTo: initialSearch.sailTo,
        startDate: initialSearch.startDate,
        endDate: initialSearch.endDate,
        guests:
          overrides.guests !== undefined ? String(overrides.guests) : String(guests),
        cabinId: overrides.cabinId ?? selectedAvailabilityId ?? undefined,
      });
      router.replace(href, { scroll: false });
    },
    [sailingId, initialSearch, guests, selectedAvailabilityId, router],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setError(false);

    void getCruiseSailingDetail(sailingId, apiQuery)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDetail(null);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('404')) setNotFound(true);
        else setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sailingId, apiQuery, fetchId]);

  const selectedCabin = useMemo(
    () =>
      detail?.cabins.find((item) => item.availabilityId === selectedAvailabilityId) ?? null,
    [detail, selectedAvailabilityId],
  );

  function handleGuestsChange(value: number) {
    setGuests(value);
    syncUrl({ guests: String(value) });
  }

  function handleSelectCabin(availabilityId: string) {
    setSelectedAvailabilityId(availabilityId);
    syncUrl({ cabinId: availabilityId });
  }

  function handleReserve() {
    if (!selectedAvailabilityId) {
      document.getElementById('cabins')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const query = buildReservationQuery({
      kind: 'cabin',
      sailingId,
      cabinAvailabilityId: selectedAvailabilityId,
      guests,
    });
    router.push(`/booking/cart?${query}`);
  }

  const listHref = `/cruises${buildCruisesSearchQuery({
    sailFrom: initialSearch.sailFrom,
    sailTo: initialSearch.sailTo,
    startDate: initialSearch.startDate,
    endDate: initialSearch.endDate,
    guests: String(guests),
  })}`;

  const sidebarProps = detail
    ? {
        detail,
        selectedCabin,
        guests,
        onGuestsChange: handleGuestsChange,
        onReserve: handleReserve,
        t: c,
        locale,
      }
    : null;

  if (loading && !detail) {
    return <DetailPageSkeletonShell loadingLabel={c.loading} />;
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
        <HomeHeader />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-atg-fg">{c.notFound}</h1>
          <p className="mt-2 text-sm text-atg-muted">{c.notFoundHint}</p>
          <Link
            href={listHref}
            className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
          >
            {c.backToList}
          </Link>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (error || !detail || !sidebarProps) {
    return (
      <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
        <HomeHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-atg-elevated p-5 dark:border-red-900/40 dark:bg-atg-elevated">
            <p className="text-sm text-red-700 dark:text-red-300">{c.loadError}</p>
            <button
              type="button"
              onClick={() => setFetchId((value) => value + 1)}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              {c.retry}
            </button>
          </div>
        </main>
        <HomeFooter />
      </div>
    );
  }

  const nightsLabel =
    detail.durationNights === 1
      ? `1 ${c.nightSingular}`
      : `${detail.durationNights} ${c.nightPlural}`;

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />

      <div className="border-b border-atg-border bg-atg-elevated dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-atg-muted"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-primary">
              {c.breadcrumbHome}
            </Link>
            <span className="text-atg-muted/60" aria-hidden>
              ›
            </span>
            <Link href={listHref} className="transition-colors hover:text-primary">
              {c.breadcrumbCruisesDetail}
            </Link>
            <span className="text-atg-muted/60" aria-hidden>
              ›
            </span>
            <span className="font-medium text-atg-fg">{detail.itineraryName}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="min-w-0 space-y-8 lg:col-span-2">
            {detail.images && detail.images.length > 0 ? (
              <ProductGallery
                images={detail.images}
                name={detail.shipName}
                labels={{
                  ariaLabel: c.galleryAria,
                  openLightbox: c.galleryOpenLightbox,
                  close: c.galleryClose,
                  previous: c.galleryPrevious,
                  next: c.galleryNext,
                  counter: c.galleryCounter,
                }}
              />
            ) : null}

            <header>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                {detail.cruiseLineName}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-atg-fg sm:text-3xl">
                {detail.itineraryName}
              </h1>
              <p className="mt-2 text-sm text-atg-muted">
                {c.shipLabel}: {detail.shipName} ·{' '}
                {formatCruisePortLabel(detail.sailFromPortCode, detail.sailFromPortName)} →{' '}
                {formatCruisePortLabel(detail.sailToPortCode, detail.sailToPortName)} ·{' '}
                {formatDisplayDate(detail.departureDate, locale)} →{' '}
                {formatDisplayDate(detail.returnDate, locale)} · {nightsLabel}
              </p>
            </header>

            <CruiseItinerarySection detail={detail} t={c} locale={locale} />

            <CruiseCabinsSection
              cabins={detail.cabins}
              currency={detail.currency}
              selectedAvailabilityId={selectedAvailabilityId}
              guests={guests}
              onSelectCabin={handleSelectCabin}
              t={c}
            />
          </div>

          <CruiseBookingSidebar {...sidebarProps} />
        </div>
      </div>

      <CruiseBookingMobileBar {...sidebarProps} />
      <HomeFooter />
    </div>
  );
}
