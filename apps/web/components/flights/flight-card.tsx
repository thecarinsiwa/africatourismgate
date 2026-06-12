'use client';

import Link from 'next/link';
import {
  buildFlightDetailHref,
  formatDuration,
  formatFlightPrice,
  formatFlightTime,
  type FlightDetailSearchParams,
} from '../../lib/flights/listings';
import type { FlightSearchResult } from '../../lib/flights/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import type { Translations } from '../../lib/i18n/translations';

type FlightCardProps = {
  flight: FlightSearchResult;
  t: Translations['flights'];
  searchParams?: FlightDetailSearchParams;
  locale?: string;
};

export function FlightCard({ flight, t, searchParams = {}, locale }: FlightCardProps) {
  const detailParams = {
    from: searchParams.from ?? flight.departureAirportIata,
    to: searchParams.to ?? flight.arrivalAirportIata,
    departureDate: searchParams.departureDate ?? flight.departureDate,
    returnDate: searchParams.returnDate,
    passengers: searchParams.passengers,
    classId: searchParams.classId,
  };
  const detailHref = buildFlightDetailHref(flight.id, detailParams);
  const reserveHref = buildFlightDetailHref(flight.id, detailParams, '#reserve');
  const priceLabel = formatFlightPrice(flight.minPriceCents, flight.currency);

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-atg-border dark:bg-atg-elevated">
      <div className="flex flex-col sm:flex-row">
        <div className="relative flex shrink-0 flex-col justify-center bg-gradient-to-br from-[#1b1b2f] to-primary/80 px-6 py-8 text-white sm:w-56 lg:w-64">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {flight.airlineName}
          </p>
          <p className="mt-1 text-2xl font-bold">{flight.flightNumber}</p>
          {flight.roundTrip && (
            <span className="mt-3 inline-flex w-fit rounded-md bg-white/15 px-2 py-1 text-xs font-semibold">
              {t.roundTripBadge}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div>
                <p className="text-2xl font-bold text-[#0f1a16] dark:text-white">
                  {flight.departureAirportIata}
                </p>
                <p className="text-sm text-gray-500 dark:text-atg-muted">
                  {flight.departureAirportCity}
                </p>
                <p className="mt-1 text-sm font-medium text-[#0f1a16] dark:text-white">
                  {formatFlightTime(flight.departureTime, locale)}
                </p>
              </div>

              <div className="flex flex-col items-center px-2 text-center">
                <p className="text-xs text-gray-400 dark:text-atg-muted">
                  {formatDuration(flight.durationMinutes)}
                </p>
                <div className="my-1 flex w-full items-center gap-1" aria-hidden>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="h-px flex-1 bg-gray-200 dark:bg-atg-border" />
                  <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="h-px flex-1 bg-gray-200 dark:bg-atg-border" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
                <p className="text-xs text-gray-400 dark:text-atg-muted">{t.direct}</p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-[#0f1a16] dark:text-white">
                  {flight.arrivalAirportIata}
                </p>
                <p className="text-sm text-gray-500 dark:text-atg-muted">
                  {flight.arrivalAirportCity}
                </p>
                <p className="mt-1 text-sm font-medium text-[#0f1a16] dark:text-white">
                  {formatFlightTime(flight.arrivalTime, locale)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-gray-100 pt-4 dark:border-atg-border">
            <div>
              {!searchParams.departureDate && flight.departureDate && (
                <p className="text-xs text-gray-500 dark:text-atg-muted">
                  {t.departureDate}: {formatDisplayDate(flight.departureDate, locale)}
                </p>
              )}
              <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-atg-muted">
                {flight.roundTrip ? t.roundTripFrom : t.fromPrice}
              </p>
              <p className="text-2xl font-bold text-[#0f1a16] dark:text-white">{priceLabel}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={detailHref}
                className="inline-flex min-h-[44px] items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary dark:border-atg-border dark:text-white/80 dark:hover:border-primary dark:hover:text-white"
              >
                {t.viewDetails}
              </Link>
              <Link
                href={reserveHref}
                className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
              >
                {t.bookNow}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
