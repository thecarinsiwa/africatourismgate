'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { searchFlights } from '../../lib/api/public';
import { formatAirportLabel } from '../../lib/flights/airports';
import {
  buildFlightDetailHref,
  formatDuration,
  formatFlightPrice,
  parsePassengersParam,
  toFlightSearchQuery,
  type FlightsSearchParams,
} from '../../lib/flights/listings';
import type { FlightSearchResult } from '../../lib/flights/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';

export type { FlightsSearchParams };

type FlightsPageContentProps = {
  initialSearch: FlightsSearchParams;
};

export function FlightsPageContent({ initialSearch }: FlightsPageContentProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const [results, setResults] = useState<FlightSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const apiQuery = useMemo(
    () => toFlightSearchQuery(initialSearch),
    [initialSearch],
  );

  const passengers = parsePassengersParam(initialSearch.passengers);
  const routeLabel =
    initialSearch.from && initialSearch.to
      ? `${formatAirportLabel(initialSearch.from)} → ${formatAirportLabel(initialSearch.to)}`
      : null;

  useEffect(() => {
    let cancelled = false;
    if (!apiQuery) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    void searchFlights(apiQuery)
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
  }, [apiQuery, fetchId]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />

      <div className="border-b border-gray-200 bg-white dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white sm:text-3xl">
            {t.nav.flights}
          </h1>
          {routeLabel && (
            <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
              {routeLabel}
              {initialSearch.departureDate && (
                <>
                  {' · '}
                  {formatDisplayDate(initialSearch.departureDate, locale)}
                  {initialSearch.returnDate
                    ? ` → ${formatDisplayDate(initialSearch.returnDate, locale)}`
                    : ''}
                </>
              )}
              {' · '}
              {passengers} {passengers > 1 ? 'passagers' : 'passager'}
            </p>
          )}
          <Link
            href="/#search"
            className="mt-4 inline-flex min-h-[44px] items-center text-sm font-semibold text-primary hover:underline"
          >
            Modifier la recherche
          </Link>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {!apiQuery && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-atg-border dark:bg-atg-elevated">
            <p className="text-sm text-gray-600 dark:text-atg-muted">
              Indiquez un départ, une destination et une date pour rechercher des vols.
            </p>
            <Link
              href="/#search"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-hover"
            >
              Lancer une recherche
            </Link>
          </div>
        )}

        {apiQuery && loading && (
          <p className="text-center text-sm text-gray-600 dark:text-atg-muted">
            Recherche des vols…
          </p>
        )}

        {apiQuery && error && (
          <div className="rounded-xl border border-red-200 bg-white p-5 dark:border-red-900/40 dark:bg-atg-elevated">
            <p className="text-sm text-red-700 dark:text-red-300">
              Impossible de charger les vols. Vérifiez que l&apos;API est démarrée.
            </p>
            <button
              type="button"
              onClick={() => setFetchId((value) => value + 1)}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Réessayer
            </button>
          </div>
        )}

        {apiQuery && !loading && !error && results.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-atg-border dark:bg-atg-elevated">
            <p className="font-medium text-[#0f1a16] dark:text-white">
              Aucun vol pour ces critères
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
              Essayez d&apos;autres dates ou aéroports (ex. Kinshasa → Nairobi).
            </p>
          </div>
        )}

        {apiQuery && !loading && !error && results.length > 0 && (
          <ul className="space-y-4">
            {results.map((flight) => {
              const detailHref = buildFlightDetailHref(flight.id, {
                ...initialSearch,
                passengers: String(passengers),
              });
              const reserveHref = `${detailHref}#reserve`;

              return (
                <li
                  key={flight.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 dark:border-atg-border dark:bg-atg-elevated"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        {flight.airlineName} · {flight.flightNumber}
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#0f1a16] dark:text-white">
                        {flight.departureAirportIata} → {flight.arrivalAirportIata}
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-atg-muted">
                        {new Date(flight.departureTime).toLocaleTimeString(locale, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' → '}
                        {new Date(flight.arrivalTime).toLocaleTimeString(locale, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' · '}
                        {formatDuration(flight.durationMinutes)}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <p className="text-xl font-bold text-[#0f1a16] dark:text-white">
                        {formatFlightPrice(flight.minPriceCents, flight.currency)}
                        {flight.roundTrip ? ' AR' : ''}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={detailHref}
                          className="inline-flex min-h-[44px] items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-[#0f1a16] hover:bg-gray-50 dark:border-atg-border dark:text-white dark:hover:bg-white/5"
                        >
                          Voir détails
                        </Link>
                        <Link
                          href={reserveHref}
                          className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-hover"
                        >
                          Réserver
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}
