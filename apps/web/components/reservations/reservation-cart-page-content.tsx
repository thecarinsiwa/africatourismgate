'use client';

import type { PropertyDetail } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatCarPrice } from '../../lib/cars/listings';
import type { VehicleDetail } from '../../lib/cars/types';
import { formatActivityPrice, formatScheduleTime } from '../../lib/activities/listings';
import type { ActivityDetail } from '../../lib/activities/types';
import { getAccommodationDetail, getActivityDetail, getCruiseSailingDetail, getFlightDetail, getPackageDetail, getVehicleDetail } from '../../lib/api/public';
import { formatPackagePrice } from '../../lib/packages/listings';
import type { PackageDetail } from '../../lib/packages/types';
import { formatAirportLabel } from '../../lib/flights/airports';
import { formatFlightPrice } from '../../lib/flights/listings';
import type { FlightDetail } from '../../lib/flights/types';
import { formatCruisePrice } from '../../lib/cruises/listings';
import type { CruiseSailingDetail } from '../../lib/cruises/types';
import { getClientAccessToken } from '../../lib/auth/client-session';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatHotelPrice } from '../../lib/hotels/listings';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import {
  buildDraftBrowseHref,
  buildDraftDetailHref,
  buildReservationQuery,
  isActivityScheduleOfferBookable,
  isActivityScheduleReservationDraft,
  isCabinReservationDraft,
  isFlightReservationDraft,
  isCabinOfferBookable,
  isPackageReservationDraft,
  isPackageReservationDraftReady,
  isRoomReservationDraft,
  isVehicleReservationDraft,
  type ReservationDraft,
} from '../../lib/reservations/flow';
import { PackagePriceDisplay } from '../packages/package-price-display';
import { PackageReservationSummary } from '../packages/package-reservation-summary';
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
  const cr = t.cruises;
  const p = t.packages;
  const act = t.activities;

  const [hotelDetail, setHotelDetail] = useState<PropertyDetail | null>(null);
  const [flightDetail, setFlightDetail] = useState<FlightDetail | null>(null);
  const [vehicleDetail, setVehicleDetail] = useState<VehicleDetail | null>(null);
  const [cruiseDetail, setCruiseDetail] = useState<CruiseSailingDetail | null>(null);
  const [activityDetail, setActivityDetail] = useState<ActivityDetail | null>(null);
  const [packageDetail, setPackageDetail] = useState<PackageDetail | null>(null);
  const [packageActivities, setPackageActivities] = useState<ActivityDetail[]>([]);
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

  const vehicleReady = useMemo((): VehicleDetail | null => {
    if (!draft || !isVehicleReservationDraft(draft) || !vehicleDetail) return null;
    if (vehicleDetail.availabilitySlot.id !== draft.availabilitySlotId) return null;
    return vehicleDetail;
  }, [draft, vehicleDetail]);

  const cruiseCabin = useMemo(
    () =>
      draft && isCabinReservationDraft(draft)
        ? (cruiseDetail?.cabins.find((item) => item.availabilityId === draft.cabinAvailabilityId) ??
          null)
        : null,
    [draft, cruiseDetail],
  );

  const cruiseReady = useMemo(
    () =>
      draft && isCabinReservationDraft(draft) && isCabinOfferBookable(cruiseCabin, draft.guests)
        ? cruiseCabin
        : null,
    [draft, cruiseCabin],
  );

  const activitySchedule = useMemo(
    () =>
      draft && isActivityScheduleReservationDraft(draft)
        ? (activityDetail?.schedules.find((item) => item.scheduleId === draft.scheduleId) ?? null)
        : null,
    [draft, activityDetail],
  );

  const activityReady = useMemo(
    () =>
      draft &&
      isActivityScheduleReservationDraft(draft) &&
      isActivityScheduleOfferBookable(activitySchedule, draft.participants)
        ? activitySchedule
        : null,
    [draft, activitySchedule],
  );

  const packageReady = useMemo(() => {
    if (!draft || !isPackageReservationDraft(draft) || !packageDetail) return false;
    return isPackageReservationDraftReady(draft, packageActivities);
  }, [draft, packageDetail, packageActivities]);

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
            setCruiseDetail(null);
            setActivityDetail(null);
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
            setCruiseDetail(null);
            setActivityDetail(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (isActivityScheduleReservationDraft(draft)) {
      void getActivityDetail(draft.activityId, {
        date: draft.date,
        participants: draft.participants,
      })
        .then((data) => {
          if (!cancelled) {
            setActivityDetail(data);
            setHotelDetail(null);
            setFlightDetail(null);
            setVehicleDetail(null);
            setCruiseDetail(null);
            setPackageDetail(null);
            setPackageActivities([]);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (isPackageReservationDraft(draft)) {
      void getPackageDetail(draft.packageId)
        .then(async (pkg) => {
          if (cancelled) return;
          setPackageDetail(pkg);
          setHotelDetail(null);
          setFlightDetail(null);
          setVehicleDetail(null);
          setCruiseDetail(null);
          setActivityDetail(null);
          const activities = await Promise.all(
            draft.lines.map((line) =>
              getActivityDetail(line.activityId, {
                date: draft.date,
                participants: draft.participants,
              }),
            ),
          );
          if (!cancelled) setPackageActivities(activities);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (isCabinReservationDraft(draft)) {
      void getCruiseSailingDetail(draft.sailingId, { guests: draft.guests })
        .then((data) => {
          if (!cancelled) {
            setCruiseDetail(data);
            setHotelDetail(null);
            setFlightDetail(null);
            setVehicleDetail(null);
            setActivityDetail(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (isVehicleReservationDraft(draft)) {
      void getVehicleDetail(draft.vehicleId, {
        pickupDate: draft.pickupDate,
        returnDate: draft.returnDate,
      })
        .then((data) => {
          if (!cancelled) {
            setVehicleDetail(data);
            setHotelDetail(null);
            setFlightDetail(null);
            setCruiseDetail(null);
            setActivityDetail(null);
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
        : draft && isCabinReservationDraft(draft) && cruiseReady && cruiseDetail
          ? formatCruisePrice(cruiseReady.priceCents, cruiseDetail.currency)
          : draft &&
              isActivityScheduleReservationDraft(draft) &&
              activityReady &&
              activityDetail
            ? formatActivityPrice(
                activityReady.priceCents * draft.participants,
                activityDetail.currency,
              )
            : draft && isPackageReservationDraft(draft) && packageDetail && packageReady
              ? formatPackagePrice(packageDetail.pricing.totalCents, packageDetail.pricing.currency)
            : vehicleReady
            ? formatCarPrice(vehicleReady.totalPriceCents, vehicleReady.currency)
            : '--';

  const canContinue =
    Boolean(draft) &&
    !loading &&
    ((isRoomReservationDraft(draft!) && room) ||
      (isFlightReservationDraft(draft!) && flightClass) ||
      (isCabinReservationDraft(draft!) && cruiseReady) ||
      (isActivityScheduleReservationDraft(draft!) && activityReady) ||
      (isPackageReservationDraft(draft!) && packageReady) ||
      Boolean(vehicleReady));

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

              {!loading && vehicleReady && isVehicleReservationDraft(draft) && (
                <div className="space-y-3">
                  <p className="text-sm text-primary">{vehicleReady.agency.name}</p>
                  <h2 className="text-xl font-bold text-[#0f1a16] dark:text-white">
                    {vehicleReady.category.exampleModel ?? vehicleReady.category.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">
                    {vehicleReady.agency.city || c.pickupLocation}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">
                    {formatDisplayDate(draft.pickupDate, locale)} {'->'}{' '}
                    {formatDisplayDate(draft.returnDate, locale)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">
                    {vehicleReady.rentalDays === 1
                      ? `1 ${c.daySingular}`
                      : `${vehicleReady.rentalDays} ${c.dayPlural}`}
                  </p>
                </div>
              )}

              {!loading && cruiseReady && cruiseDetail && isCabinReservationDraft(draft) && (
                <div className="space-y-3">
                  <p className="text-sm text-primary">{cruiseDetail.cruiseLineName}</p>
                  <h2 className="text-xl font-bold text-[#0f1a16] dark:text-white">
                    {cruiseDetail.itineraryName}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">
                    {cr.shipLabel}: {cruiseDetail.shipName} · {cruiseReady.categoryName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">
                    {formatDisplayDate(cruiseDetail.departureDate, locale)} {'->'}{' '}
                    {formatDisplayDate(cruiseDetail.returnDate, locale)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-atg-muted">
                    {draft.guests === 1
                      ? `1 ${cr.guestSingular}`
                      : cr.guestPlural.replace('{n}', String(draft.guests))}
                  </p>
                </div>
              )}

              {!loading &&
                activityReady &&
                activityDetail &&
                isActivityScheduleReservationDraft(draft) && (
                  <div className="space-y-3">
                    <p className="text-sm text-primary">{activityDetail.providerName}</p>
                    <h2 className="text-xl font-bold text-[#0f1a16] dark:text-white">
                      {activityDetail.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-atg-muted">
                      {formatDisplayDate(draft.date, locale)} ·{' '}
                      {formatScheduleTime(activityReady.startDatetime, locale)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-atg-muted">
                      {draft.participants === 1
                        ? `1 ${f.passengerSingular}`
                        : f.passengerPlural.replace('{n}', String(draft.participants))}
                    </p>
                  </div>
                )}

              {!loading &&
                draft &&
                isPackageReservationDraft(draft) &&
                packageDetail &&
                packageReady && (
                  <PackageReservationSummary
                    draft={draft}
                    packageDetail={packageDetail}
                    packageActivities={packageActivities}
                    t={p}
                    participantSingular={act.participantSingular}
                    participantPlural={act.participantPlural}
                    locale={locale}
                  />
                )}

              {!loading &&
                draft &&
                isPackageReservationDraft(draft) &&
                packageDetail &&
                !packageReady && (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {p.packageCartInvalid}{' '}
                    <Link href={detailHref} className="font-semibold underline">
                      {p.modifySelection}
                    </Link>
                  </p>
                )}

              {!loading && isCabinReservationDraft(draft) && cruiseDetail && !cruiseReady && (
                <p className="text-sm text-red-700 dark:text-red-300">
                  {cr.unavailable}.{' '}
                  <Link href={detailHref} className="font-semibold underline">
                    {cr.modifySearch}
                  </Link>
                </p>
              )}

              {!loading && isVehicleReservationDraft(draft) && vehicleDetail && !vehicleReady && (
                <p className="text-sm text-red-700 dark:text-red-300">
                  Créneau indisponible ou modifié.{' '}
                  <Link href={detailHref} className="font-semibold underline">
                    Modifier la sélection
                  </Link>
                </p>
              )}

              {!loading &&
                isActivityScheduleReservationDraft(draft) &&
                activityDetail &&
                !activityReady && (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Créneau indisponible ou places insuffisantes.{' '}
                    <Link href={detailHref} className="font-semibold underline">
                      Modifier la sélection
                    </Link>
                  </p>
                )}

              {!loading &&
                draft &&
                !room &&
                !flightClass &&
                !cruiseReady &&
                !activityReady &&
                !(draft && isPackageReservationDraft(draft) && packageReady) &&
                !vehicleReady && (
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
                {draft && isPackageReservationDraft(draft) ? p.packagePrice : 'Total estimé'}
              </p>
              {draft && isPackageReservationDraft(draft) && packageDetail && packageReady ? (
                <div className="mt-2">
                  <PackagePriceDisplay
                    pricing={packageDetail.pricing}
                    discountBadgeTemplate={p.discountBadge}
                  />
                </div>
              ) : (
                <p className="mt-1 text-2xl font-bold text-[#0f1a16] dark:text-white">{totalLabel}</p>
              )}
              {!accessToken && (
                <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
                  Connexion client requise au prochain écran.
                </p>
              )}
              <Link
                href={nextHref}
                aria-disabled={!canContinue}
                className={`mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                  canContinue
                    ? 'bg-primary hover:bg-primary-hover'
                    : 'pointer-events-none cursor-not-allowed bg-primary/50'
                }`}
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
