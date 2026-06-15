'use client';

import type { PropertyDetail } from '@africatourismgate/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createBooking, createBookingCheckoutSession } from '../../lib/api/booking';
import { formatCarPrice } from '../../lib/cars/listings';
import type { VehicleDetail } from '../../lib/cars/types';
import { formatActivityPrice, formatScheduleTime } from '../../lib/activities/listings';
import type { ActivityDetail } from '../../lib/activities/types';
import { getAccommodationDetail, getActivityDetail, getCruiseSailingDetail, getFlightDetail, getPackageDetail, getVehicleDetail } from '../../lib/api/public';
import { formatPackagePrice } from '../../lib/packages/listings';
import type { PackageDetail } from '../../lib/packages/types';
import { fetchPackageDraftValidationData } from '../../lib/packages/package-validation';
import type { PackageDraftValidationData } from '../../lib/reservations/flow';
import { formatAirportLabel } from '../../lib/flights/airports';
import { formatFlightPrice } from '../../lib/flights/listings';
import type { FlightDetail } from '../../lib/flights/types';
import { formatCruisePrice } from '../../lib/cruises/listings';
import type { CruiseSailingDetail } from '../../lib/cruises/types';
import { ensureClientAccessToken, getClientAccessToken } from '../../lib/auth/client-session';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatHotelPrice } from '../../lib/hotels/listings';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import {
  buildCheckoutRequest,
  buildDraftBrowseHref,
  buildDraftDetailHref,
  buildReservationQuery,
  isActivityScheduleOfferBookable,
  isActivityScheduleReservationDraft,
  isCabinOfferBookable,
  isCabinReservationDraft,
  isFlightReservationDraft,
  isPackageReservationDraft,
  isPackageReservationDraftStructurallyComplete,
  isRoomReservationDraft,
  isVehicleReservationDraft,
  type ReservationDraft,
} from '../../lib/reservations/flow';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { PackagePriceDisplay } from '../packages/package-price-display';
import { PackageReservationSummary } from '../packages/package-reservation-summary';

type Props = {
  draft: ReservationDraft | null;
};

export function ReservationRecapPageContent({ draft }: Props) {
  const router = useRouter();
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
  const [packageValidation, setPackageValidation] = useState<PackageDraftValidationData | null>(
    null,
  );
  const [loading, setLoading] = useState(Boolean(draft));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            setPackageValidation(null);
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
          const validation = await fetchPackageDraftValidationData(draft);
          if (!cancelled) setPackageValidation(validation);
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
    if (vehicleDetail.availabilitySlot?.id !== draft.availabilitySlotId) return null;
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
    if (!draft || !isPackageReservationDraft(draft) || !packageDetail) {
      return false;
    }
    return isPackageReservationDraftStructurallyComplete(draft, packageDetail.items);
  }, [draft, packageDetail]);

  async function handleCheckout() {
    if (!draft) return;
    const accessToken = await ensureClientAccessToken();
    if (!accessToken) {
      setError('Authentification requise pour continuer vers le paiement.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const booking = await createBooking(accessToken, buildCheckoutRequest(draft));
  
      if (booking.requiresVerification && booking.verificationId) {
        const params = new URLSearchParams({
          verificationId: booking.verificationId,
          bookingId: booking.booking.id,
          next: '/reservations/recap',
        });
        router.push(`/booking/verify?${params.toString()}`);
        return;
      }
      const checkout = await createBookingCheckoutSession(accessToken, booking.booking.id);
      window.location.assign(checkout.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de demarrer le paiement.');
      setSubmitting(false);
    }
  }

  const cartHref = draft ? `/booking/cart?${buildReservationQuery(draft)}` : '/booking/cart';
  const browseHref = draft ? buildDraftBrowseHref(draft) : '/hotels';
  const detailHref = draft ? buildDraftDetailHref(draft) : browseHref;
  const hasToken = Boolean(getClientAccessToken());

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
            : null;

  const canPay =
    Boolean(draft) &&
    !loading &&
    ((isRoomReservationDraft(draft!) && room) ||
      (isFlightReservationDraft(draft!) && flightClass) ||
      (isCabinReservationDraft(draft!) && cruiseReady) ||
      (isActivityScheduleReservationDraft(draft!) && activityReady) ||
      (isPackageReservationDraft(draft!) && packageReady) ||
      Boolean(vehicleReady));

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-atg-fg">Recapitulatif</h1>

        {!draft && (
          <div className="mt-6 rounded-xl border border-red-200 bg-atg-elevated p-5 dark:border-red-900/40 dark:bg-atg-elevated">
            <p className="text-sm text-red-700 dark:text-red-300">
              Donnees de reservation invalides. Revenez au panier.
            </p>
            <Link
              href="/booking/cart"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Retour panier
            </Link>
          </div>
        )}

        {draft && (
          <div className="mt-6 rounded-xl border border-atg-border bg-atg-elevated p-5 dark:border-atg-border dark:bg-atg-elevated">
            {loading && <p className="text-sm text-atg-muted">Chargement…</p>}

            {!loading && isRoomReservationDraft(draft) && hotelDetail && room && (
              <div className="space-y-2">
                <p className="text-sm text-primary">{hotelDetail.destinationName}</p>
                <h2 className="text-xl font-bold text-atg-fg">{hotelDetail.name}</h2>
                <p className="text-sm text-atg-muted">{room.name}</p>
                <p className="text-sm text-atg-muted">
                  {formatDisplayDate(draft.checkIn, locale)} {'->'}{' '}
                  {formatDisplayDate(draft.checkOut, locale)}
                </p>
                <p className="text-sm text-atg-muted">
                  {draft.guests} voyageur{draft.guests > 1 ? 's' : ''}
                </p>
                {totalLabel && (
                  <p className="pt-1 text-2xl font-bold text-atg-fg">
                    {totalLabel}
                  </p>
                )}
              </div>
            )}

            {!loading && isFlightReservationDraft(draft) && flightDetail && flightClass && (
              <div className="space-y-2">
                <p className="text-sm text-primary">
                  {flightDetail.airlineName} · {flightDetail.flightNumber}
                </p>
                <h2 className="text-xl font-bold text-atg-fg">
                  {formatAirportLabel(flightDetail.departureAirport.iataCode, flightDetail.departureAirport)} →{' '}
                  {formatAirportLabel(flightDetail.arrivalAirport.iataCode, flightDetail.arrivalAirport)}
                </h2>
                <p className="text-sm text-atg-muted">
                  {f.classNames[flightClass.className] ?? flightClass.className}
                </p>
                <p className="text-sm text-atg-muted">
                  {formatDisplayDate(draft.departureDate, locale)}
                </p>
                <p className="text-sm text-atg-muted">
                  {draft.passengers === 1
                    ? `1 ${f.passengerSingular}`
                    : f.passengerPlural.replace('{n}', String(draft.passengers))}
                </p>
                {totalLabel && (
                  <p className="pt-1 text-2xl font-bold text-atg-fg">
                    {totalLabel}
                  </p>
                )}
              </div>
            )}

            {!loading && cruiseReady && cruiseDetail && isCabinReservationDraft(draft) && (
              <div className="space-y-2">
                <p className="text-sm text-primary">{cruiseDetail.cruiseLineName}</p>
                <h2 className="text-xl font-bold text-atg-fg">
                  {cruiseDetail.itineraryName}
                </h2>
                <p className="text-sm text-atg-muted">
                  {cr.shipLabel}: {cruiseDetail.shipName} · {cruiseReady.categoryName}
                </p>
                <p className="text-sm text-atg-muted">
                  {formatDisplayDate(cruiseDetail.departureDate, locale)} {'->'}{' '}
                  {formatDisplayDate(cruiseDetail.returnDate, locale)}
                </p>
                <p className="text-sm text-atg-muted">
                  {draft.guests === 1
                    ? `1 ${cr.guestSingular}`
                    : cr.guestPlural.replace('{n}', String(draft.guests))}
                </p>
                {totalLabel && (
                  <p className="pt-1 text-2xl font-bold text-atg-fg">
                    {totalLabel}
                  </p>
                )}
              </div>
            )}

            {!loading &&
              activityReady &&
              activityDetail &&
              isActivityScheduleReservationDraft(draft) && (
                <div className="space-y-2">
                  <p className="text-sm text-primary">{activityDetail.providerName}</p>
                  <h2 className="text-xl font-bold text-atg-fg">
                    {activityDetail.title}
                  </h2>
                  <p className="text-sm text-atg-muted">
                    {formatDisplayDate(draft.date, locale)} ·{' '}
                    {formatScheduleTime(activityReady.startDatetime, locale)}
                  </p>
                  <p className="text-sm text-atg-muted">
                    {draft.participants === 1
                      ? `1 ${f.passengerSingular}`
                      : f.passengerPlural.replace('{n}', String(draft.participants))}
                  </p>
                  {totalLabel && (
                    <p className="pt-1 text-2xl font-bold text-atg-fg">
                      {totalLabel}
                    </p>
                  )}
                </div>
              )}

            {!loading &&
              draft &&
              isPackageReservationDraft(draft) &&
              packageDetail &&
              packageReady &&
              packageValidation && (
                <div className="space-y-4">
                  <PackageReservationSummary
                    draft={draft}
                    packageDetail={packageDetail}
                    validation={packageValidation}
                    t={p}
                    participantSingular={act.participantSingular}
                    participantPlural={act.participantPlural}
                    locale={locale}
                    showPricing
                  />
                  <div className="border-t border-atg-border pt-4 dark:border-atg-border">
                    <PackagePriceDisplay
                      pricing={packageDetail.pricing}
                      priceLabel={p.packagePrice}
                      discountBadgeTemplate={p.discountBadge}
                      className="text-left [&_div]:justify-start"
                    />
                  </div>
                  {totalLabel && (
                    <p className="sr-only">Total: {totalLabel}</p>
                  )}
                </div>
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

            {!loading && vehicleReady && isVehicleReservationDraft(draft) && (
              <div className="space-y-2">
                <p className="text-sm text-primary">{vehicleReady.agency.name}</p>
                <h2 className="text-xl font-bold text-atg-fg">
                  {vehicleReady.category.exampleModel ?? vehicleReady.category.name}
                </h2>
                <p className="text-sm text-atg-muted">
                  {vehicleReady.agency.city || c.pickupLocation}
                </p>
                <p className="text-sm text-atg-muted">
                  {formatDisplayDate(draft.pickupDate, locale)} {'->'}{' '}
                  {formatDisplayDate(draft.returnDate, locale)}
                </p>
                <p className="text-sm text-atg-muted">
                  {vehicleReady.rentalDays === 1
                    ? `1 ${c.daySingular}`
                    : `${vehicleReady.rentalDays} ${c.dayPlural}`}
                </p>
                {totalLabel && (
                  <p className="pt-1 text-2xl font-bold text-atg-fg">
                    {totalLabel}
                  </p>
                )}
              </div>
            )}

            {!loading && isCabinReservationDraft(draft) && cruiseDetail && !cruiseReady && (
              <p className="text-sm text-red-700 dark:text-red-300">
                {cr.unavailable}.{' '}
                <Link href={detailHref} className="font-semibold underline">
                  {cr.modifySearch}
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

            {!loading && !canPay && draft && !isPackageReservationDraft(draft) && (
              <p className="text-sm text-red-700 dark:text-red-300">
                Selection indisponible.{' '}
                <Link href={browseHref} className="font-semibold underline">
                  Reprendre la recherche
                </Link>
              </p>
            )}

            {!hasToken && (
              <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                Connexion client requise pour lancer Stripe Checkout.
              </p>
            )}
            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={cartHref}
                className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-atg-fg hover:bg-atg-surface dark:border-atg-border dark:text-white/80 dark:hover:bg-white/5"
              >
                Retour panier
              </Link>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={submitting || !canPay}
                className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Redirection Stripe…' : 'Payer avec Stripe'}
              </button>
            </div>
          </div>
        )}
      </main>
      <HomeFooter />
    </div>
  );
}
