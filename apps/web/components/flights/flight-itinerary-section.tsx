'use client';

import type { FlightDetail } from '../../lib/flights/types';
import { formatDuration, formatFlightTime } from '../../lib/flights/listings';
import type { Translations } from '../../lib/i18n/translations';

type FlightItinerarySectionProps = {
  detail: FlightDetail;
  t: Translations['flights'];
  locale?: string;
};

export function FlightItinerarySection({ detail, t, locale }: FlightItinerarySectionProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-atg-border dark:bg-atg-elevated sm:p-6">
      <h2 className="text-lg font-bold text-[#0f1a16] dark:text-white">{t.itineraryTitle}</h2>

      <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-atg-muted">
            {t.departure}
          </p>
          <p className="mt-1 text-xl font-bold text-[#0f1a16] dark:text-white">
            {detail.departureAirport.iataCode}
          </p>
          <p className="text-sm text-gray-600 dark:text-atg-muted">{detail.departureAirport.city}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-atg-muted">{detail.departureAirport.name}</p>
          <p className="mt-2 text-lg font-semibold text-[#0f1a16] dark:text-white">
            {formatFlightTime(detail.departureTime, locale)}
          </p>
        </div>

        <div className="hidden flex-col items-center px-4 text-center sm:flex">
          <p className="text-sm text-gray-500 dark:text-atg-muted">
            {formatDuration(detail.durationMinutes)}
          </p>
          <div className="my-2 flex w-24 items-center gap-1" aria-hidden>
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

        <div className="sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-atg-muted">
            {t.arrival}
          </p>
          <p className="mt-1 text-xl font-bold text-[#0f1a16] dark:text-white">
            {detail.arrivalAirport.iataCode}
          </p>
          <p className="text-sm text-gray-600 dark:text-atg-muted">{detail.arrivalAirport.city}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-atg-muted">{detail.arrivalAirport.name}</p>
          <p className="mt-2 text-lg font-semibold text-[#0f1a16] dark:text-white">
            {formatFlightTime(detail.arrivalTime, locale)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500 dark:text-atg-muted sm:hidden">
        {formatDuration(detail.durationMinutes)} · {t.direct}
      </p>
    </section>
  );
}
