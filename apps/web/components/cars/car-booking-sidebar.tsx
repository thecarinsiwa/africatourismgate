'use client';

import type { VehicleTrip } from '@africatourismgate/types';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatDisplayDate, todayISODate } from '../../lib/hotels/dates';
import { formatCarPrice } from '../../lib/cars/listings';
import type { VehicleDetail } from '../../lib/cars/types';
import type { Translations } from '../../lib/i18n/message-types';
import { useBookingCtaLabel } from '../../lib/bookings/use-booking-cta';
import { listPublicVehicleTrips } from '../../lib/api/vehicle-trips';
import {
  AUTH_CHANGED_EVENT,
  ensureClientAccessToken,
} from '../../lib/auth/client-session';
import {
  BookingSidebarBody,
  BookingSidebarCta,
  BookingSidebarDesktop,
  BookingSidebarField,
  BookingSidebarHint,
  BookingSidebarMobileBar,
  BookingSidebarMobileDrawer,
  BookingSidebarPriceBlock,
  BookingSidebarSummary,
  BookingSidebarTrustHints,
  bookingSidebarInputClass,
  useBookingDrawerOpenListener,
  useBookingSidebarTrustHints,
} from '../shared/booking-sidebar-shell';

export type CarReservePayload =
  | {
      mode: 'create';
      seats: number;
      departureDatetime: string;
    }
  | {
      mode: 'join';
      seats: number;
      tripId: string;
    }
  | {
      mode: 'continue';
      seats: number;
      tripId: string;
    };

function isSelectableOpenTrip(trip: VehicleTrip): boolean {
  return trip.canJoin || trip.isMine;
}

type CarBookingSidebarProps = {
  detail: VehicleDetail;
  travelDate: string;
  onTravelDateChange: (value: string) => void;
  onReserve: (payload: CarReservePayload) => void;
  reserving?: boolean;
  reserveError?: string | null;
  t: Translations['cars'];
  locale?: string;
};

function defaultDepartureLocal(travelDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate)) {
    return '';
  }
  return `${travelDate}T09:00`;
}

function toIsoFromLocalInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
}

function formatTripTime(iso: string, locale?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat(locale || undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** UTC calendar day - matches API `DATE(departureDatetime)` filter. */
function tripTravelDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
}

type OpenTripDateOption = {
  date: string;
  tripCount: number;
  seatsRemaining: number;
  /** Best (lowest) join price among open trips that day. */
  joinPriceCents: number;
  currency: string;
};

function formatJoinPaysInstead(
  template: string,
  joinCents: number,
  soloCents: number,
  currency: string,
): string | null {
  if (!(joinCents < soloCents)) return null;
  return template
    .replace('{join}', formatCarPrice(joinCents, currency))
    .replace('{solo}', formatCarPrice(soloCents, currency));
}

function CarBookingContent({
  detail,
  travelDate,
  onTravelDateChange,
  onReserve,
  reserving = false,
  reserveError = null,
  t,
  locale,
}: CarBookingSidebarProps) {
  const trustHints = useBookingSidebarTrustHints();
  const ctaLabel = useBookingCtaLabel('vehicle');
  const hasDate = Boolean(travelDate);

  const [seats, setSeats] = useState(1);
  const [selectedTripId, setSelectedTripId] = useState<string | 'new'>('new');
  const [departureLocal, setDepartureLocal] = useState(() =>
    defaultDepartureLocal(travelDate),
  );
  const [trips, setTrips] = useState<VehicleTrip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [openTripDates, setOpenTripDates] = useState<OpenTripDateOption[]>([]);
  const [openTripDatesLoading, setOpenTripDatesLoading] = useState(false);
  const [authEpoch, setAuthEpoch] = useState(0);

  useEffect(() => {
    const onAuthChanged = () => setAuthEpoch((n) => n + 1);
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
  }, []);

  useEffect(() => {
    setDepartureLocal(defaultDepartureLocal(travelDate));
    setSelectedTripId('new');
  }, [travelDate]);

  useEffect(() => {
    if (!detail.route?.id) {
      setOpenTripDates([]);
      return;
    }
    let cancelled = false;
    setOpenTripDatesLoading(true);
    void ensureClientAccessToken()
      .then((token) =>
        listPublicVehicleTrips(
          {
            vehicleId: detail.id,
            routeId: detail.route!.id,
            status: 'open',
            limit: 50,
          },
          token,
        ),
      )
      .then((page) => {
        if (cancelled) return;
        const today = todayISODate();
        const byDate = new Map<
          string,
          {
            tripCount: number;
            seatsRemaining: number;
            joinPriceCents: number;
            currency: string;
          }
        >();
        for (const trip of page.data) {
          if (!isSelectableOpenTrip(trip)) continue;
          const date = tripTravelDate(trip.departureDatetime);
          if (!date || date < today) continue;
          const current = byDate.get(date);
          if (!current) {
            byDate.set(date, {
              tripCount: 1,
              seatsRemaining: Math.max(0, trip.seatsRemaining),
              joinPriceCents: trip.priceCentsPerPerson,
              currency: trip.currency,
            });
            continue;
          }
          byDate.set(date, {
            tripCount: current.tripCount + 1,
            seatsRemaining:
              current.seatsRemaining + Math.max(0, trip.seatsRemaining),
            joinPriceCents: Math.min(
              current.joinPriceCents,
              trip.priceCentsPerPerson,
            ),
            currency: current.currency || trip.currency,
          });
        }
        setOpenTripDates(
          Array.from(byDate.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, stats]) => ({ date, ...stats })),
        );
      })
      .catch(() => {
        if (!cancelled) setOpenTripDates([]);
      })
      .finally(() => {
        if (!cancelled) setOpenTripDatesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [detail.id, detail.route?.id, authEpoch]);

  useEffect(() => {
    if (!hasDate || !detail.route?.id) {
      setTrips([]);
      return;
    }
    let cancelled = false;
    setTripsLoading(true);
    void ensureClientAccessToken()
      .then((token) =>
        listPublicVehicleTrips(
          {
            vehicleId: detail.id,
            routeId: detail.route!.id,
            travelDate,
            status: 'open',
            limit: 20,
          },
          token,
        ),
      )
      .then((page) => {
        if (cancelled) return;
        const open = page.data.filter(isSelectableOpenTrip);
        const mineFirst = [...open].sort((a, b) => {
          if (a.isMine === b.isMine) return 0;
          return a.isMine ? -1 : 1;
        });
        setTrips(mineFirst);
        setSelectedTripId(mineFirst.length > 0 ? mineFirst[0]!.id : 'new');
      })
      .catch(() => {
        if (!cancelled) setTrips([]);
      })
      .finally(() => {
        if (!cancelled) setTripsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [detail.id, detail.route?.id, travelDate, hasDate, authEpoch]);

  const selectedTrip =
    selectedTripId !== 'new'
      ? trips.find((trip) => trip.id === selectedTripId) ?? null
      : null;

  const maxSeats = useMemo(() => {
    if (selectedTrip?.isMine) {
      return Math.max(1, selectedTrip.maxCapacity);
    }
    if (selectedTrip) {
      return Math.max(1, selectedTrip.seatsRemaining);
    }
    if (trips[0]?.maxCapacity) {
      return Math.max(1, trips[0].maxCapacity);
    }
    return 8;
  }, [selectedTrip, trips]);

  useEffect(() => {
    if (seats > maxSeats) {
      setSeats(maxSeats);
    }
  }, [maxSeats, seats]);

  const soloPriceCents =
    detail.route?.priceCents ?? detail.totalPriceCents ?? detail.priceCents;
  const unitPriceCents = selectedTrip
    ? selectedTrip.priceCentsPerPerson
    : detail.totalPriceCents;
  const currency = selectedTrip?.currency ?? detail.currency;
  const lineTotalCents = unitPriceCents * seats;

  const canReserve =
    hasDate &&
    Boolean(detail.route?.id) &&
    !reserving &&
    seats >= 1 &&
    (selectedTripId === 'new'
      ? Boolean(departureLocal) && Boolean(detail.availabilitySlot?.id)
      : Boolean(selectedTrip?.canJoin || selectedTrip?.isMine));

  const actionCtaLabel = selectedTrip?.isMine
    ? t.continueTrip
    : ctaLabel;

  function handleCta() {
    if (!canReserve) return;
    if (selectedTripId === 'new') {
      onReserve({
        mode: 'create',
        seats,
        departureDatetime: toIsoFromLocalInput(departureLocal),
      });
      return;
    }
    if (selectedTrip?.isMine) {
      onReserve({
        mode: 'continue',
        seats,
        tripId: selectedTripId,
      });
      return;
    }
    onReserve({
      mode: 'join',
      seats,
      tripId: selectedTripId,
    });
  }

  return (
    <BookingSidebarBody title={t.reserveSection}>
      <BookingSidebarField label={t.travelDate}>
        <input
          type="date"
          value={travelDate}
          min={todayISODate()}
          onChange={(e) => onTravelDateChange(e.target.value)}
          className={bookingSidebarInputClass}
        />
      </BookingSidebarField>

      {!hasDate && <BookingSidebarHint>{t.selectDatesHint}</BookingSidebarHint>}

      {detail.route?.id && (openTripDatesLoading || openTripDates.length > 0) ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
            {t.openTripDatesTitle}
          </p>
          {!openTripDatesLoading ? (
            <BookingSidebarHint>{t.openTripDatesHint}</BookingSidebarHint>
          ) : null}
          {openTripDatesLoading ? (
            <p className="text-sm text-atg-muted">{t.loading}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {openTripDates.map((option) => {
                const selected = travelDate === option.date;
                const joinLabel = formatJoinPaysInstead(
                  t.joinPaysInstead,
                  option.joinPriceCents,
                  soloPriceCents,
                  option.currency || detail.currency,
                );
                return (
                  <button
                    key={option.date}
                    type="button"
                    onClick={() => onTravelDateChange(option.date)}
                    aria-pressed={selected}
                    className={`rounded-lg border px-3 py-1.5 text-left text-sm transition-colors ${
                      selected
                        ? 'border-primary bg-primary/5 text-atg-fg'
                        : 'border-atg-border bg-atg-elevated text-atg-fg hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium">
                      {formatDisplayDate(option.date, locale)}
                    </span>
                    <span className="mt-0.5 block text-xs text-atg-muted">
                      {t.openTripDateTrips.replace('{n}', String(option.tripCount))}
                      {' · '}
                      {t.seatsRemaining.replace(
                        '{n}',
                        String(option.seatsRemaining),
                      )}
                    </span>
                    {joinLabel ? (
                      <span className="mt-0.5 block text-xs font-medium text-primary">
                        {joinLabel}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {hasDate && (
        <BookingSidebarSummary>
          {detail.route.departureCity} → {detail.route.arrivalCity}
          {' · '}
          {formatDisplayDate(travelDate, locale)}
        </BookingSidebarSummary>
      )}

      {hasDate ? (
        <>
          <BookingSidebarField label={t.seatsLabel}>
            <input
              type="number"
              min={1}
              max={maxSeats}
              value={seats}
              onChange={(e) => {
                const next = Number.parseInt(e.target.value, 10);
                if (Number.isFinite(next) && next >= 1) {
                  setSeats(Math.min(next, maxSeats));
                }
              }}
              className={bookingSidebarInputClass}
            />
          </BookingSidebarField>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
              {t.openTripsTitle}
            </p>
            {tripsLoading && (
              <p className="text-sm text-atg-muted">{t.loading}</p>
            )}
            {!tripsLoading && trips.length === 0 && (
              <BookingSidebarHint>{t.noOpenTrips}</BookingSidebarHint>
            )}
            {!tripsLoading &&
              trips.map((trip) => {
                const joinLabel = trip.isMine
                  ? null
                  : formatJoinPaysInstead(
                      t.joinPaysInstead,
                      trip.priceCentsPerPerson,
                      soloPriceCents,
                      trip.currency,
                    );
                return (
                  <label
                    key={trip.id}
                    className={`flex cursor-pointer flex-col gap-0.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      selectedTripId === trip.id
                        ? 'border-primary bg-primary/5'
                        : 'border-atg-border bg-atg-elevated'
                    }`}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <input
                        type="radio"
                        name="vehicle-trip"
                        checked={selectedTripId === trip.id}
                        onChange={() => setSelectedTripId(trip.id)}
                      />
                      <span className="font-medium text-atg-fg">
                        {formatTripTime(trip.departureDatetime, locale)}
                      </span>
                      {trip.isMine ? (
                        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                          {t.yourTrip}
                        </span>
                      ) : null}
                      <span className="text-atg-muted">
                        · {formatCarPrice(trip.priceCentsPerPerson, trip.currency)}{' '}
                        {t.pricePerPerson.toLowerCase()}
                      </span>
                    </span>
                    <span className="pl-6 text-xs text-atg-muted">
                      {t.seatsRemaining.replace('{n}', String(trip.seatsRemaining))}
                    </span>
                    {joinLabel ? (
                      <span className="pl-6 text-xs font-medium text-primary">
                        {joinLabel}
                      </span>
                    ) : null}
                  </label>
                );
              })}

            {trips.length === 0 ? (
              <label
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  selectedTripId === 'new'
                    ? 'border-primary bg-primary/5'
                    : 'border-atg-border bg-atg-elevated'
                }`}
              >
                <input
                  type="radio"
                  name="vehicle-trip"
                  checked={selectedTripId === 'new'}
                  onChange={() => setSelectedTripId('new')}
                />
                <span className="font-medium text-atg-fg">{t.newTripOption}</span>
              </label>
            ) : null}
          </div>

          {selectedTripId === 'new' && trips.length === 0 ? (
            <BookingSidebarField label={t.departureTime}>
              <input
                type="datetime-local"
                value={departureLocal}
                onChange={(e) => setDepartureLocal(e.target.value)}
                className={bookingSidebarInputClass}
              />
            </BookingSidebarField>
          ) : null}

          <BookingSidebarPriceBlock
            label={t.totalRental}
            amount={formatCarPrice(lineTotalCents, currency)}
            detail={`${formatCarPrice(unitPriceCents, currency)} · ${t.pricePerPerson}`}
          />

          <BookingSidebarHint>
            {t.paymentClosesHint.replace('{hours}', '3')}
          </BookingSidebarHint>
        </>
      ) : null}

      {reserveError ? (
        <p className="text-sm text-red-600 dark:text-red-400">{reserveError}</p>
      ) : null}

      <BookingSidebarCta
        label={reserving ? t.reservingTrip : actionCtaLabel}
        disabled={!canReserve}
        onClick={handleCta}
      />
      <BookingSidebarTrustHints items={trustHints} />
    </BookingSidebarBody>
  );
}

export function CarBookingSidebar(props: CarBookingSidebarProps) {
  return (
    <BookingSidebarDesktop>
      <CarBookingContent {...props} />
    </BookingSidebarDesktop>
  );
}

export function CarBookingMobileBar(props: CarBookingSidebarProps) {
  const tBooking = useTranslations('bookingSidebar');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const ctaLabel = useBookingCtaLabel('vehicle');
  const hasDate = Boolean(props.travelDate);

  useBookingDrawerOpenListener(() => setDrawerOpen(true));

  return (
    <>
      <BookingSidebarMobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={props.t.reserveSection}
      >
        <CarBookingContent {...props} />
      </BookingSidebarMobileDrawer>
      <BookingSidebarMobileBar
        priceLabel={hasDate ? props.t.totalRental : undefined}
        priceAmount={
          hasDate
            ? formatCarPrice(props.detail.totalPriceCents, props.detail.currency)
            : undefined
        }
        hint={hasDate ? undefined : props.t.selectDatesHint}
        ctaLabel={props.reserving ? props.t.reservingTrip : ctaLabel}
        ctaDisabled={props.reserving}
        onCtaClick={() => setDrawerOpen(true)}
        configureLabel={tBooking('mobileConfigure')}
        onConfigureClick={() => setDrawerOpen(true)}
      />
    </>
  );
}
