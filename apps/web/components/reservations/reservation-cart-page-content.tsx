'use client';

import type { PropertyDetail } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatCarPrice } from '../../lib/cars/listings';
import type { VehicleDetail } from '../../lib/cars/types';
import { getAccommodationDetail, getFlightDetail, getVehicleDetail } from '../../lib/api/public';
import { formatAirportLabel } from '../../lib/flights/airports';
import { formatFlightPrice } from '../../lib/flights/listings';
import type { FlightDetail } from '../../lib/flights/types';
import { getClientAccessToken } from '../../lib/auth/client-session';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatHotelPrice } from '../../lib/hotels/listings';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import {
  buildDraftBrowseHref,
  buildDraftDetailHref,
  buildReservationQuery,
  isFlightReservationDraft,
  isRoomReservationDraft,
  isVehicleReservationDraft,
  type ReservationDraft,
} from '../../lib/reservations/flow';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';

type Props = {
  draft: ReservationDraft | null;
};

export function ReservationCartPageContent({ draft }: Props) {
  const { locale } = useLocale();
  const t = useTranslations();
  const f = t.flights;
  const c = t.cars;

  const [hotelDetail, setHotelDetail] = useState<PropertyDetail | null>(null);
  const [flightDetail, setFlightDetail] = useState<FlightDetail | null>(null);
  const [vehicleDetail, setVehicleDetail] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(draft));

  const room = useMemo(
    () =>
      draft && isRoomReservationDraft(draft)
        ? (hotelDetail?.rooms.find((item) => item.id === draft.roomId) ?? null)
        : null,
    [draft, hotelDetail],
  );

  const flightClass = useMemo(
    () =>
      draft && isFlightReservationDraft(draft)
        ? (flightDetail?.classes.find((item) => item.id === draft.flightClassId) ?? null)
        : null,
    [draft, flightDetail],
  );

  useEffect(() => {
    let cancelled = false;
    if (!draft) return;

    setLoading(true);

    if (isRoomReservationDraft(draft)) {
      void getAccommodationDetail(draft.propertyId, {
        checkIn: draft.checkIn,
        checkOut: draft.checkOut,
        guests: draft.guests,
      })
        .then((data) => {
          if (!cancelled) {
            setHotelDetail(data);
            setFlightDetail(null);
            setVehicleDetail(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (isFlightReservationDraft(draft)) {
      void getFlightDetail(draft.flightId, {
        departureDate: draft.departureDate,
        passengers: draft.passengers,
      })
        .then((data) => {
          if (!cancelled) {
            setFlightDetail(data);
            setHotelDetail(null);
            setVehicleDetail(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      void getVehicleDetail(draft.vehicleId, {
        pickupDate: draft.pickupDate,
        returnDate: draft.returnDate,
      })
        .then((data) => {
          if (!cancelled) {
            setVehicleDetail(data);
            setHotelDetail(null);
            setFlightDetail(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [draft]);

  const accessToken = getClientAccessToken();
  const nextHref = draft ? `/booking/recap?${buildReservationQuery(draft)}` : '/hotels';
  const backHref = draft ? buildDraftBrowseHref(draft) : '/hotels';
  const detailHref = draft ? buildDraftDetailHref(draft) : backHref;

  const totalLabel =
    draft && isRoomReservationDraft(draft) && room
      ? formatHotelPrice(room.totalPriceCents ?? room.basePriceCents, room.currency)
      : draft && isFlightReservationDraft(draft) && flightClass && flightDetail
        ? formatFlightPrice(flightClass.totalPriceCents, flightDetail.currency)
        : draft && isVehicleReservationDraft(draft) && vehicleDetail
          ? formatCarPrice(vehicleDetail.totalPriceCents, vehicleDetail.currency)
          : '--';

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white">Panier réservation</h1>

        {!draft && (
          <div className="mt-6 rounded-xl border border-red-200 bg-white p-5 dark:border-red-900/40 dark:bg-atg-elevated">
            <p className="text-sm text-red-700 dark:text-red-300">
              Données de réservation incomplètes. Reprenez depuis une fiche produit.
            </p>
            <Link
              href="/hotels"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Retour aux hébergements
            </Link>
          </div>
        )}

        {draft && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
            <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-atg-border dark:bg-atg-elevated">
              {loading && <p className="text-sm text-gray-600 dark:text-atg-muted">Chargement…</p>}

              {!loading && isRoomReservationDraft(draft) && hotelDetail && room && (
                <div className="space-y-3">
                  <p className="text-sm text-primary">{hotelDetail.destinationName}</p>
                  <h2 className="text-xl font-bold text-[#0f1a16] dark:text-white">
                    {hotelDetail.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">{room.name}</p>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">
                    {formatDisplayDate(draft.checkIn, locale)} {'->'}{' '}
                    {formatDisplayDate(draft.checkOut, locale)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">
                    {draft.guests} voyageur{draft.guests > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {!loading && isFlightReservationDraft(draft) && flightDetail && flightClass && (
                <div className="space-y-3">
                  <p className="text-sm text-primary">
                    {flightDetail.airlineName} · {flightDetail.flightNumber}
                  </p>
                  <h2 className="text-xl font-bold text-[#0f1a16] dark:text-white">
                  {formatAirportLabel(flightDetail.departureAirport.iataCode, flightDetail.departureAirport)} →{' '}
                  {formatAirportLabel(flightDetail.arrivalAirport.iataCode, flightDetail.arrivalAirport)}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">
                    {f.classNames[flightClass.className] ?? flightClass.className}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">
                    {formatDisplayDate(draft.departureDate, locale)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">
                    {draft.passengers === 1
                      ? `1 ${f.passengerSingular}`
                      : f.passengerPlural.replace('{n}', String(draft.passengers))}
                  </p>
                </div>
              )}

              {!loading && isVehicleReservationDraft(draft) && vehicleDetail && (
                <div className="space-y-3">
                  <p className="text-sm text-primary">{vehicleDetail.agency.name}</p>
                  <h2 className="text-xl font-bold text-[#0f1a16] dark:text-white">
                    {vehicleDetail.category.exampleModel ?? vehicleDetail.category.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">
                    {vehicleDetail.agency.city || c.pickupLocation}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">
                    {formatDisplayDate(draft.pickupDate, locale)} {'->'}{' '}
                    {formatDisplayDate(draft.returnDate, locale)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">
                    {vehicleDetail.rentalDays === 1
                      ? `1 ${c.daySingular}`
                      : `${vehicleDetail.rentalDays} ${c.dayPlural}`}
                  </p>
                </div>
              )}

              {!loading && draft && !room && !flightClass && !vehicleDetail && (
                <p className="text-sm text-red-700 dark:text-red-300">
                  Impossible d&apos;afficher cette réservation.{' '}
                  <Link href={detailHref} className="font-semibold underline">
                    Modifier la sélection
                  </Link>
                </p>
              )}
            </section>

            <aside className="h-fit min-w-[240px] rounded-xl border border-gray-200 bg-white p-5 dark:border-atg-border dark:bg-atg-elevated">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-atg-muted">
                Total estimé
              </p>
              <p className="mt-1 text-2xl font-bold text-[#0f1a16] dark:text-white">{totalLabel}</p>
              {!accessToken && (
                <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
                  Connexion client requise au prochain écran.
                </p>
              )}
              <Link
                href={nextHref}
                className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Continuer vers récap
              </Link>
            </aside>
          </div>
        )}
      </main>
      <HomeFooter />
    </div>
  );
}
