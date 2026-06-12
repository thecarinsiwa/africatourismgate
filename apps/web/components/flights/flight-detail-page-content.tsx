'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getFlightDetail } from '../../lib/api/public';
import { formatAirportLabel } from '../../lib/flights/airports';
import {
  buildFlightsSearchQuery,
  formatDuration,
  formatFlightPrice,
  toFlightDetailQuery,
  type FlightDetailSearchParams,
} from '../../lib/flights/listings';
import type { FlightDetail } from '../../lib/flights/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';

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
  const { locale } = useLocale();
  const [detail, setDetail] = useState<FlightDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const apiQuery = useMemo(
    () => toFlightDetailQuery(initialSearch),
    [initialSearch],
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
        if (err instanceof Error && err.message.includes('404')) {
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
  }, [flightId, apiQuery, fetchId]);

  if (loading && !detail) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
        <HomeHeader />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-gray-600 dark:text-atg-muted">
            Chargement du vol…
          </p>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
        <HomeHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white">Vol introuvable</h1>
          <Link
            href="/flights"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Retour aux vols
          </Link>
        </main>
        <HomeFooter />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
        <HomeHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-white p-5 dark:border-red-900/40 dark:bg-atg-elevated">
            <p className="text-sm text-red-700 dark:text-red-300">
              Impossible de charger ce vol.
            </p>
            <button
              type="button"
              onClick={() => setFetchId((value) => value + 1)}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Réessayer
            </button>
          </div>
        </main>
        <HomeFooter />
      </div>
    );
  }

  const listHref = `/flights${buildFlightsSearchQuery(initialSearch)}`;

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
              Accueil
            </Link>
            <span aria-hidden>/</span>
            <Link href={listHref} className="transition-colors hover:text-primary">
              {t.nav.flights}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-[#0f1a16] dark:text-white">
              {detail.flightNumber}
            </span>
          </nav>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white sm:text-3xl">
              {detail.airlineName} · {detail.flightNumber}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
              {formatAirportLabel(detail.departureAirport.iataCode)} →{' '}
              {formatAirportLabel(detail.arrivalAirport.iataCode)} ·{' '}
              {formatDisplayDate(detail.departureDate, locale)} ·{' '}
              {detail.passengers} {detail.passengers > 1 ? 'passagers' : 'passager'}
            </p>

            <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 dark:border-atg-border dark:bg-atg-elevated">
              <h2 className="text-lg font-bold text-[#0f1a16] dark:text-white">Itinéraire</h2>
              <p className="mt-3 text-sm text-gray-600 dark:text-atg-muted">
                {detail.departureAirport.name} ({detail.departureAirport.iataCode}) →{' '}
                {detail.arrivalAirport.name} ({detail.arrivalAirport.iataCode})
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
                {new Date(detail.departureTime).toLocaleTimeString(locale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' → '}
                {new Date(detail.arrivalTime).toLocaleTimeString(locale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' · '}
                {formatDuration(detail.durationMinutes)}
              </p>
            </section>

            <section id="classes" className="mt-8">
              <h2 className="text-lg font-bold text-[#0f1a16] dark:text-white">Classes disponibles</h2>
              <ul className="mt-4 space-y-3">
                {detail.classes.map((flightClass) => {
                  const unavailable = flightClass.availableSeats <= 0;
                  return (
                    <li
                      key={flightClass.id}
                      className={`rounded-xl border p-4 ${
                        unavailable
                          ? 'border-gray-200 bg-gray-50 opacity-60 dark:border-atg-border dark:bg-atg-surface'
                          : 'border-gray-200 bg-white dark:border-atg-border dark:bg-atg-elevated'
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold capitalize text-[#0f1a16] dark:text-white">
                            {flightClass.className.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-atg-muted">
                            {flightClass.availableSeats} siège
                            {flightClass.availableSeats > 1 ? 's' : ''} disponible
                            {flightClass.availableSeats > 1 ? 's' : ''}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-[#0f1a16] dark:text-white">
                          {formatFlightPrice(flightClass.totalPriceCents, detail.currency)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <aside
            id="reserve"
            className="mt-8 h-fit rounded-xl border border-gray-200 bg-white p-5 dark:border-atg-border dark:bg-atg-elevated lg:sticky lg:top-24"
          >
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-atg-muted">
              À partir de
            </p>
            <p className="mt-1 text-2xl font-bold text-[#0f1a16] dark:text-white">
              {formatFlightPrice(detail.minPriceCents, detail.currency)}
            </p>
            <p className="mt-3 text-sm text-gray-600 dark:text-atg-muted">
              Sélection de classe et réservation disponibles prochainement.
            </p>
            <Link
              href={listHref}
              className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-[#0f1a16] hover:bg-gray-50 dark:border-atg-border dark:text-white dark:hover:bg-white/5"
            >
              Retour aux résultats
            </Link>
          </aside>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
