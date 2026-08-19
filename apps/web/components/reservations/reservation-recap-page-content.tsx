'use client';

import type { PropertyDetail } from '@africatourismgate/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createBooking, createBookingCheckoutSession, requestBooking } from '../../lib/api/booking';
import { uploadBookingIdentityDocument } from '../../lib/api/booking-identity-documents';
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
import { ensureClientAccessToken, getClientAccessToken } from '../../lib/auth/client-session';
import { useBookingItemTypeModes } from '../../components/booking-modes-provider';
import { isAssistedBookingDraft } from '../../lib/bookings/booking-mode';
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
  packageReservationTotalCents,
  type ReservationDraft,
} from '../../lib/reservations/flow';
import { PackagePriceDisplay } from '../packages/package-price-display';
import { PackageReservationSummary } from '../packages/package-reservation-summary';
import { CheckoutPageShell } from './checkout-page-shell';
import { CheckoutManifestForm, manifestDraftToPayload, type ManifestEntryDraft } from './checkout-manifest-form';
import { CheckoutRecapLine } from './checkout-recap-line';
import { StripePaymentError } from './stripe-payment-error';
import { createApiClient } from '@africatourismgate/api-client';

type Props = {
  draft: ReservationDraft | null;
};

export function ReservationRecapPageContent({ draft }: Props) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useTranslations();
  const ck = t.checkout;
  const f = t.flights;
  const c = t.cars;
  const cr = t.cruises;
  const p = t.packages;

  const [hotelDetail, setHotelDetail] = useState<PropertyDetail | null>(null);
  const [flightDetail, setFlightDetail] = useState<FlightDetail | null>(null);
  const [vehicleDetail, setVehicleDetail] = useState<VehicleDetail | null>(null);
  const [cruiseDetail, setCruiseDetail] = useState<CruiseSailingDetail | null>(null);
  const [activityDetail, setActivityDetail] = useState<ActivityDetail | null>(null);
  const [packageDetail, setPackageDetail] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(draft));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manifestEntries, setManifestEntries] = useState<ManifestEntryDraft[]>([]);
  const [manifestErrors, setManifestErrors] = useState<Record<number, string>>({});

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
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (isPackageReservationDraft(draft)) {
      void getPackageDetail(draft.packageId)
        .then((pkg) => {
          if (cancelled) return;
          setPackageDetail(pkg);
          setHotelDetail(null);
          setFlightDetail(null);
          setVehicleDetail(null);
          setCruiseDetail(null);
          setActivityDetail(null);
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
    if (!draft || !isPackageReservationDraft(draft)) {
      return false;
    }
    return isPackageReservationDraftStructurallyComplete(draft);
  }, [draft]);

  const modes = useBookingItemTypeModes();
  const isAssisted = draft ? isAssistedBookingDraft(draft, modes) : false;

  const travelerCount = useMemo(() => {
    if (!draft) return 0;
    if (isRoomReservationDraft(draft)) return draft.guests;
    if (isFlightReservationDraft(draft)) return draft.passengers;
    if (isCabinReservationDraft(draft)) return draft.guests;
    if (isActivityScheduleReservationDraft(draft)) return draft.participants;
    if (isPackageReservationDraft(draft)) return draft.travelers;
    return 1;
  }, [draft]);

  async function handleCheckout() {
    if (!draft) return;
    const accessToken = await ensureClientAccessToken();
    if (!accessToken) {
      setError(ck.stripeError.authDescription);
      return;
    }

    if (isAssisted) {
      const errors: Record<number, string> = {};
      manifestEntries.forEach((entry, i) => {
        if (!entry.fullName.trim()) {
          errors[i] = ck.manifest.fullNameRequired.replace('{n}', String(i + 1));
        }
      });
      if (Object.keys(errors).length > 0) {
        setManifestErrors(errors);
        return;
      }
      setManifestErrors({});
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = buildCheckoutRequest(draft);
      if (isAssisted) {
        const response = await requestBooking(accessToken, payload);

        const apiBaseUrl =
          (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '');
        const apiClient = createApiClient({ baseUrl: apiBaseUrl, accessToken });
        const filled = manifestEntries.filter((e) => e.fullName.trim());
        await Promise.all(
          filled.map((entry, i) =>
            apiClient.createBookingManifestEntry(
              response.bookingId,
              manifestDraftToPayload(entry, i),
            ),
          ),
        );
        const filesToUpload = filled.filter((e) => e.file);
        if (filesToUpload.length > 0) {
          await Promise.allSettled(
            filesToUpload.map((entry) =>
              uploadBookingIdentityDocument(response.bookingId, entry.file!, 'passport'),
            ),
          );
        }

        router.push(`/booking/request-success?booking_id=${response.bookingId}`);
        return;
      }

      const booking = await createBooking(accessToken, payload);
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
      setError(err instanceof Error ? err.message : ck.stripeError.genericHint);
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
              ? formatPackagePrice(
                  packageReservationTotalCents(packageDetail.pricing, draft.travelers),
                  packageDetail.pricing.currency,
                )
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

  const stepperLabels = useMemo(
    () => ({
      stepperAriaLabel: ck.stepperAriaLabel,
      cart: ck.stepCart,
      recap: ck.stepRecap,
      payment: isAssisted ? ck.stepRequest : ck.stepPayment,
      confirmation: ck.stepConfirmation,
      cancelled: ck.stepCancelled,
    }),
    [ck, isAssisted],
  );

  return (
    <CheckoutPageShell
      title={ck.recapTitle}
      currentStep="payment"
      stepperLabels={stepperLabels}
    >
        {!draft && (
          <div className="mt-6 rounded-xl border border-red-200 bg-atg-elevated p-5 dark:border-red-900/40 dark:bg-atg-elevated">
            <p className="text-sm text-red-700 dark:text-red-300">{ck.invalidRecap}</p>
            <Link
              href="/booking/cart"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              {ck.backToCart}
            </Link>
          </div>
        )}

        {draft && (
          <div className="mt-6 space-y-4 rounded-xl border border-atg-border bg-atg-elevated p-5 dark:border-atg-border dark:bg-atg-elevated">
            {loading && <p className="text-sm text-atg-muted">{ck.loading}</p>}

            {!loading && isRoomReservationDraft(draft) && hotelDetail && room && (
              <CheckoutRecapLine
                icon="hotel"
                eyebrow={hotelDetail.destinationName}
                title={hotelDetail.name}
                details={
                  <>
                    <p>{room.name}</p>
                    <p>
                      {formatDisplayDate(draft.checkIn, locale)} {'->'}{' '}
                      {formatDisplayDate(draft.checkOut, locale)}
                    </p>
                    <p>
                      {draft.guests} voyageur{draft.guests > 1 ? 's' : ''}
                    </p>
                  </>
                }
                price={totalLabel ?? undefined}
              />
            )}

            {!loading && isFlightReservationDraft(draft) && flightDetail && flightClass && (
              <CheckoutRecapLine
                icon="flight"
                eyebrow={`${flightDetail.airlineName} · ${flightDetail.flightNumber}`}
                title={`${formatAirportLabel(flightDetail.departureAirport.iataCode, flightDetail.departureAirport)} → ${formatAirportLabel(flightDetail.arrivalAirport.iataCode, flightDetail.arrivalAirport)}`}
                details={
                  <>
                    <p>{f.classNames[flightClass.className] ?? flightClass.className}</p>
                    <p>{formatDisplayDate(draft.departureDate, locale)}</p>
                    <p>
                      {draft.passengers === 1
                        ? `1 ${f.passengerSingular}`
                        : f.passengerPlural.replace('{n}', String(draft.passengers))}
                    </p>
                  </>
                }
                price={totalLabel ?? undefined}
              />
            )}

            {!loading && cruiseReady && cruiseDetail && isCabinReservationDraft(draft) && (
              <CheckoutRecapLine
                icon="cruise"
                eyebrow={cruiseDetail.cruiseLineName}
                title={cruiseDetail.itineraryName}
                details={
                  <>
                    <p>
                      {cr.shipLabel}: {cruiseDetail.shipName} · {cruiseReady.categoryName}
                    </p>
                    <p>
                      {formatDisplayDate(cruiseDetail.departureDate, locale)} {'->'}{' '}
                      {formatDisplayDate(cruiseDetail.returnDate, locale)}
                    </p>
                    <p>
                      {draft.guests === 1
                        ? `1 ${cr.guestSingular}`
                        : cr.guestPlural.replace('{n}', String(draft.guests))}
                    </p>
                  </>
                }
                price={totalLabel ?? undefined}
              />
            )}

            {!loading &&
              activityReady &&
              activityDetail &&
              isActivityScheduleReservationDraft(draft) && (
                <CheckoutRecapLine
                  icon="activity"
                  eyebrow={activityDetail.providerName}
                  title={activityDetail.title}
                  details={
                    <>
                      <p>
                        {formatDisplayDate(draft.date, locale)} ·{' '}
                        {formatScheduleTime(activityReady.startDatetime, locale)}
                      </p>
                      <p>
                        {draft.participants === 1
                          ? `1 ${f.passengerSingular}`
                          : f.passengerPlural.replace('{n}', String(draft.participants))}
                      </p>
                    </>
                  }
                  price={totalLabel ?? undefined}
                />
              )}

            {!loading &&
              draft &&
              isPackageReservationDraft(draft) &&
              packageDetail &&
              packageReady && (
                <div className="space-y-4">
                  <PackageReservationSummary
                    draft={draft}
                    packageDetail={packageDetail}
                    t={p}
                    locale={locale}
                    showPricing
                  />
                  <div className="border-t border-atg-border pt-4 dark:border-atg-border">
                    <PackagePriceDisplay
                      pricing={{
                        ...packageDetail.pricing,
                        subtotalCents:
                          packageDetail.pricing.subtotalCents * draft.travelers,
                        discountAmountCents:
                          packageDetail.pricing.discountAmountCents * draft.travelers,
                        totalCents: packageReservationTotalCents(
                          packageDetail.pricing,
                          draft.travelers,
                        ),
                      }}
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
              <CheckoutRecapLine
                icon="car"
                eyebrow={vehicleReady.agency.name}
                title={vehicleReady.category.exampleModel ?? vehicleReady.category.name}
                details={
                  <>
                    <p>{vehicleReady.agency.city || c.pickupLocation}</p>
                    <p>
                      {formatDisplayDate(draft.pickupDate, locale)} {'->'}{' '}
                      {formatDisplayDate(draft.returnDate, locale)}
                    </p>
                    <p>
                      {vehicleReady.rentalDays === 1
                        ? `1 ${c.daySingular}`
                        : `${vehicleReady.rentalDays} ${c.dayPlural}`}
                    </p>
                  </>
                }
                price={totalLabel ?? undefined}
              />
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
                  {ck.resumeSearch}
                </Link>
              </p>
            )}

            {isAssisted && !loading && canPay && (
              <CheckoutManifestForm
                count={travelerCount}
                entries={manifestEntries}
                onChange={(entries) => {
                  setManifestEntries(entries);
                  setManifestErrors({});
                }}
                labels={ck.manifest}
                validationErrors={manifestErrors}
              />
            )}

            {!hasToken && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                {isAssisted ? ck.authRequiredRequest : ck.authRequiredPayment}
              </p>
            )}
            {error && (
              <StripePaymentError
                message={error}
                labels={ck.stripeError}
                onDismiss={() => setError(null)}
              />
            )}

            <div className="mt-6 flex flex-wrap gap-3 border-t border-atg-border pt-4 dark:border-atg-border">
              <Link
                href={cartHref}
                className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-atg-fg hover:bg-atg-surface dark:border-atg-border dark:text-white/80 dark:hover:bg-white/5"
              >
                {ck.backToCart}
              </Link>
              <button
                type="button"
                onClick={() => void handleCheckout()}
                disabled={submitting || !canPay}
                className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? isAssisted
                    ? ck.requestSubmitting
                    : ck.stripeRedirecting
                  : isAssisted
                    ? ck.requestBooking
                    : ck.payWithStripe}
              </button>
            </div>
          </div>
        )}
    </CheckoutPageShell>
  );
}
