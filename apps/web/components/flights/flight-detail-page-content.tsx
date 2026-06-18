'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getFlightDetail } from '../../lib/api/public';
import { formatAirportLabel } from '../../lib/flights/airports';
import {
  buildFlightDetailHref,
  buildFlightsSearchQuery,
  parsePassengersParam,
  toFlightDetailQuery,
  type FlightDetailSearchParams,
} from '../../lib/flights/listings';
import type { FlightDetail } from '../../lib/flights/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { buildReservationQuery } from '../../lib/reservations/flow';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { FlightBookingMobileBar, FlightBookingSidebar } from './flight-booking-sidebar';
import { FlightClassesSection } from './flight-classes-section';
import { FlightItinerarySection } from './flight-itinerary-section';

export type FlightDetailPageSearch = FlightDetailSearchParams;

type FlightDetailPageContentProps = {
  flightId: string;
  initialSearch: FlightDetailPageSearch;
};

export function FlightDetailPageContent({
  flightId,
  initialSearch,
}: FlightDetailPageContentProps) {
  const t = useTranslations();
  const f = t.flights;
  const { locale } = useLocale();
  const router = useRouter();

  const [detail, setDetail] = useState<FlightDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const [passengers, setPassengers] = useState(parsePassengersParam(initialSearch.passengers));
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    initialSearch.classId ?? null,
  );

  const searchContext = useMemo(
    (): FlightDetailSearchParams => ({
      from: initialSearch.from,
      to: initialSearch.to,
      departureDate: initialSearch.departureDate,
      returnDate: initialSearch.returnDate,
      passengers: String(passengers),
      classId: selectedClassId ?? undefined,
    }),
    [initialSearch, passengers, selectedClassId],
  );

  const apiQuery = useMemo(
    () => toFlightDetailQuery(searchContext),
    [searchContext],
  );

  const syncUrl = useCallback(
    (overrides: Partial<FlightDetailPageSearch> = {}) => {
      const href = buildFlightDetailHref(flightId, {
        from: initialSearch.from,
        to: initialSearch.to,
        departureDate: initialSearch.departureDate,
        returnDate: initialSearch.returnDate,
        passengers:
          overrides.passengers !== undefined
            ? String(overrides.passengers)
            : String(passengers),
        classId: overrides.classId ?? selectedClassId ?? undefined,
      });
      router.replace(href, { scroll: false });
    },
    [flightId, initialSearch, passengers, selectedClassId, router],
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

    void getFlightDetail(flightId, apiQuery)
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
  }, [flightId, apiQuery, fetchId]);

  const selectedClass = useMemo(
    () => detail?.classes.find((item) => item.id === selectedClassId) ?? null,
    [detail, selectedClassId],
  );

  function handlePassengersChange(value: number) {
    setPassengers(value);
    syncUrl({ passengers: String(value) });
  }

  function handleSelectClass(classId: string) {
    setSelectedClassId(classId);
    syncUrl({ classId });
  }

  function handleReserve() {
    if (!selectedClassId) {
      document.getElementById('classes')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!initialSearch.departureDate) {
      document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const query = buildReservationQuery({
      kind: 'flight_class',
      flightId,
      flightClassId: selectedClassId,
      departureDate: initialSearch.departureDate,
      passengers,
    });
    router.push(`/booking/cart?${query}`);
  }

  const listHref = `/flights${buildFlightsSearchQuery({
    from: initialSearch.from,
    to: initialSearch.to,
    departureDate: initialSearch.departureDate,
    returnDate: initialSearch.returnDate,
    passengers: String(passengers),
  })}`;

  const sidebarProps = detail
    ? {
        detail,
        selectedClass,
        passengers,
        onPassengersChange: handlePassengersChange,
        onReserve: handleReserve,
        t: f,
        locale,
      }
    : null;

  if (loading && !detail) {
    return (
      <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
        <HomeHeader />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-atg-muted">{f.loading}</p>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
        <HomeHeader />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-atg-fg">{f.notFound}</h1>
          <p className="mt-2 text-sm text-atg-muted">{f.notFoundHint}</p>
          <Link
            href={listHref}
            className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
          >
            {f.backToList}
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
            <p className="text-sm text-red-700 dark:text-red-300">{f.loadError}</p>
            <button
              type="button"
              onClick={() => setFetchId((value) => value + 1)}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              {f.retry}
            </button>
          </div>
        </main>
        <HomeFooter />
      </div>
    );
  }

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
              {f.breadcrumbHome}
            </Link>
            <span className="text-atg-muted/60" aria-hidden>
              ›
            </span>
            <Link href={listHref} className="transition-colors hover:text-primary">
              {f.breadcrumbFlightsDetail}
            </Link>
            <span className="text-atg-muted/60" aria-hidden>
              ›
            </span>
            <span className="font-medium text-atg-fg">{detail.flightNumber}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="min-w-0 space-y-8 lg:col-span-2">
            <header>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                {detail.airlineName}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-atg-fg sm:text-3xl">
                {detail.flightNumber}
              </h1>
              <p className="mt-2 text-sm text-atg-muted">
                {formatAirportLabel(detail.departureAirport.iataCode, detail.departureAirport)} →{' '}
                {formatAirportLabel(detail.arrivalAirport.iataCode, detail.arrivalAirport)} ·{' '}
                {formatDisplayDate(detail.departureDate, locale)} ·{' '}
                {passengers === 1
                  ? `1 ${f.passengerSingular}`
                  : f.passengerPlural.replace('{n}', String(passengers))}
              </p>
            </header>

            <FlightItinerarySection detail={detail} t={f} locale={locale} />

            <FlightClassesSection
              classes={detail.classes}
              currency={detail.currency}
              selectedClassId={selectedClassId}
              onSelectClass={handleSelectClass}
              t={f}
            />
          </div>

          <FlightBookingSidebar {...sidebarProps} />
        </div>
      </div>

      <FlightBookingMobileBar {...sidebarProps} />
      <HomeFooter />
    </div>
  );
}
