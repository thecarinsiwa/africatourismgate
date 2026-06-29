'use client';

import Image from 'next/image';
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
import { PriceDisplay, ProductCard } from '../shared';

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

  const imageOverlay = (
    <div className="absolute inset-0 flex flex-col justify-center px-6 py-8 text-white">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
        {flight.airlineName}
      </p>
      <p className="mt-1 text-2xl font-bold">{flight.flightNumber}</p>
      {flight.roundTrip ? (
        <span className="mt-3 inline-flex w-fit rounded-md bg-white/15 px-2 py-1 text-xs font-semibold">
          {t.roundTripBadge}
        </span>
      ) : null}
    </div>
  );

  return (
    <ProductCard
      image={
        flight.imageUrl ? (
          <>
            <Image
              src={flight.imageUrl}
              alt={flight.flightNumber}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 320px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            {imageOverlay}
          </>
        ) : (
        <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#1b1b2f] to-primary/80 px-6 py-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {flight.airlineName}
          </p>
          <p className="mt-1 text-2xl font-bold">{flight.flightNumber}</p>
          {flight.roundTrip ? (
            <span className="mt-3 inline-flex w-fit rounded-md bg-white/15 px-2 py-1 text-xs font-semibold">
              {t.roundTripBadge}
            </span>
          ) : null}
        </div>
        )
      }
      title={null}
      body={
        <div className="mb-4 flex flex-col gap-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
          <div className="flex items-center gap-3 sm:block">
            <span className="inline-flex min-h-[36px] min-w-[3.25rem] shrink-0 items-center justify-center rounded-lg bg-primary/10 px-2.5 text-base font-bold tracking-wide text-primary dark:bg-primary/20 sm:hidden">
              {flight.departureAirportIata}
            </span>
            <div>
              <p className="hidden text-2xl font-bold text-atg-fg sm:block">{flight.departureAirportIata}</p>
              <p className="text-sm text-atg-muted">{flight.departureAirportCity}</p>
              <p className="mt-1 text-sm font-medium text-atg-fg">
                {formatFlightTime(flight.departureTime, locale)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center px-2 text-center sm:px-2">
            <p className="text-xs text-atg-muted">{formatDuration(flight.durationMinutes)}</p>
            <div className="my-1 flex w-full max-w-[12rem] items-center gap-1 sm:max-w-none" aria-hidden>
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-px flex-1 bg-atg-border dark:bg-atg-border" />
              <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span className="h-px flex-1 bg-atg-border dark:bg-atg-border" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
            <p className="text-xs text-atg-muted">{t.direct}</p>
          </div>

          <div className="flex items-center gap-3 sm:block sm:text-right">
            <span className="inline-flex min-h-[36px] min-w-[3.25rem] shrink-0 items-center justify-center rounded-lg bg-primary/10 px-2.5 text-base font-bold tracking-wide text-primary dark:bg-primary/20 sm:hidden">
              {flight.arrivalAirportIata}
            </span>
            <div className="sm:text-right">
              <p className="hidden text-2xl font-bold text-atg-fg sm:block">{flight.arrivalAirportIata}</p>
              <p className="text-sm text-atg-muted">{flight.arrivalAirportCity}</p>
              <p className="mt-1 text-sm font-medium text-atg-fg">
                {formatFlightTime(flight.arrivalTime, locale)}
              </p>
            </div>
          </div>
        </div>
      }
      price={
        <div>
          {!searchParams.departureDate && flight.departureDate ? (
            <p className="text-xs text-atg-muted">
              {t.departureDate}: {formatDisplayDate(flight.departureDate, locale)}
            </p>
          ) : null}
          <PriceDisplay
            prefixLabel={flight.roundTrip ? t.roundTripFrom : t.fromPrice}
            amount={priceLabel}
          />
        </div>
      }
      actions={
        <>
          <Link
            href={detailHref}
            className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-atg-fg transition-colors hover:border-primary hover:text-primary dark:border-atg-border dark:text-white/80 dark:hover:border-primary dark:hover:text-white"
          >
            {t.viewDetails}
          </Link>
          <Link
            href={reserveHref}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
          >
            {t.bookNow}
          </Link>
        </>
      }
    />
  );
}
