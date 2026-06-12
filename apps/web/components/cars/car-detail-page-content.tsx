'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getVehicleDetail } from '../../lib/api/public';
import {
  buildCarDetailHref,
  buildCarsSearchQuery,
  toVehicleDetailQuery,
  type CarDetailSearchParams,
} from '../../lib/cars/listings';
import type { VehicleDetail } from '../../lib/cars/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { buildReservationQuery } from '../../lib/reservations/flow';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { CarBookingMobileBar, CarBookingSidebar } from './car-booking-sidebar';

export type CarDetailPageSearch = CarDetailSearchParams;

type CarDetailPageContentProps = {
  vehicleId: string;
  initialSearch: CarDetailPageSearch;
};

export function CarDetailPageContent({
  vehicleId,
  initialSearch,
}: CarDetailPageContentProps) {
  const t = useTranslations();
  const c = t.cars;
  const { locale } = useLocale();
  const router = useRouter();

  const [detail, setDetail] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const [pickupDate, setPickupDate] = useState(initialSearch.pickupDate ?? '');
  const [returnDate, setReturnDate] = useState(initialSearch.returnDate ?? '');

  const searchContext: CarDetailSearchParams = {
    pickupLocation: initialSearch.pickupLocation,
    pickupDate,
    returnDate,
  };

  const apiQuery = toVehicleDetailQuery(searchContext);

  const syncUrl = useCallback(
    (overrides: Partial<CarDetailSearchParams> = {}) => {
      const href = buildCarDetailHref(vehicleId, {
        pickupLocation: initialSearch.pickupLocation,
        pickupDate: overrides.pickupDate ?? pickupDate,
        returnDate: overrides.returnDate ?? returnDate,
      });
      router.replace(href, { scroll: false });
    },
    [vehicleId, initialSearch.pickupLocation, pickupDate, returnDate, router],
  );

  useEffect(() => {
    let cancelled = false;
    if (!apiQuery) {
      setDetail(null);
      setLoading(false);
      setNotFound(false);
      setError(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setError(false);

    void getVehicleDetail(vehicleId, apiQuery)
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
  }, [vehicleId, apiQuery, fetchId]);

  function handlePickupDateChange(value: string) {
    setPickupDate(value);
    syncUrl({ pickupDate: value || undefined, returnDate: returnDate || undefined });
  }

  function handleReturnDateChange(value: string) {
    setReturnDate(value);
    syncUrl({ pickupDate: pickupDate || undefined, returnDate: value || undefined });
  }

  function handleReserve() {
    if (!pickupDate || !returnDate || returnDate <= pickupDate) {
      document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!detail?.availabilitySlot?.id) return;

    const query = buildReservationQuery({
      kind: 'vehicle',
      vehicleId,
      availabilitySlotId: detail.availabilitySlot.id,
      pickupDate,
      returnDate,
    });
    router.push(`/booking/cart?${query}`);
  }

  const listHref = `/cars${buildCarsSearchQuery({
    pickupLocation: initialSearch.pickupLocation,
    pickupDate: pickupDate || initialSearch.pickupDate,
    returnDate: returnDate || initialSearch.returnDate,
  })}`;

  const sidebarProps = detail
    ? {
        detail,
        pickupDate,
        returnDate,
        onPickupDateChange: handlePickupDateChange,
        onReturnDateChange: handleReturnDateChange,
        onReserve: handleReserve,
        t: c,
        locale,
      }
    : null;

  if (loading && !detail && apiQuery) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
        <HomeHeader />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-gray-600 dark:text-atg-muted">{c.loading}</p>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (!apiQuery) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
        <HomeHeader />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white">{c.selectDatesHint}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-atg-muted">{c.noSearchParamsHint}</p>
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

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
        <HomeHeader />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white">{c.notFound}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-atg-muted">{c.notFoundHint}</p>
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
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
        <HomeHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-white p-5 dark:border-red-900/40 dark:bg-atg-elevated">
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

  const title =
    detail.category.exampleModel ??
    detail.category.name ??
    detail.licensePlate ??
    c.categoryTitle;
  const daysLabel =
    detail.rentalDays === 1
      ? `1 ${c.daySingular}`
      : `${detail.rentalDays} ${c.dayPlural}`;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />

      <div className="border-b border-gray-200 bg-white dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav
            className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-atg-muted"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-primary">
              {c.breadcrumbHome}
            </Link>
            <span aria-hidden>/</span>
            <Link href={listHref} className="transition-colors hover:text-primary">
              {c.breadcrumbCars}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-[#0f1a16] dark:text-white">{title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="space-y-8 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b1b2f] to-primary/80 p-8 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
                {detail.category.name}
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h1>
              {detail.licensePlate && (
                <p className="mt-2 text-sm text-white/80">
                  {c.licensePlate}: {detail.licensePlate}
                </p>
              )}
            </div>

            <header>
              <p className="text-sm text-gray-600 dark:text-atg-muted">
                {formatDisplayDate(detail.pickupDate, locale)} →{' '}
                {formatDisplayDate(detail.returnDate, locale)} · {daysLabel}
              </p>
            </header>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-atg-border dark:bg-atg-elevated">
              <h2 className="mb-4 text-lg font-bold text-[#0f1a16] dark:text-white">
                {c.agencyTitle}
              </h2>
              <p className="font-semibold text-[#0f1a16] dark:text-white">{detail.agency.name}</p>
              {detail.agency.city && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-atg-muted">
                  <svg
                    className="h-4 w-4 shrink-0 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  {detail.agency.city}
                </p>
              )}
              {detail.agency.address && (
                <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
                  {detail.agency.address}
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-atg-border dark:bg-atg-elevated">
              <h2 className="mb-2 text-lg font-bold text-[#0f1a16] dark:text-white">
                {c.categoryTitle}
              </h2>
              <p className="text-sm text-gray-600 dark:text-atg-muted">
                {detail.category.name}
                {detail.category.exampleModel ? ` · ${detail.category.exampleModel}` : ''}
              </p>
            </section>
          </div>

          <CarBookingSidebar {...sidebarProps} />
        </div>
      </div>

      <CarBookingMobileBar {...sidebarProps} />
      <HomeFooter />
    </div>
  );
}
