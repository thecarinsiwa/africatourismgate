'use client';

import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatFlightPrice } from '../../lib/flights/listings';
import type { FlightDetail, FlightDetailClass } from '../../lib/flights/types';
import type { Translations } from '../../lib/i18n/translations';
import { useState } from 'react';
import { useTranslations } from '../../lib/i18n/locale-provider';
import {
  BookingSidebarBody,
  BookingSidebarCta,
  BookingSidebarDateCard,
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

type FlightBookingSidebarProps = {
  detail: FlightDetail;
  selectedClass: FlightDetailClass | null;
  passengers: number;
  onPassengersChange: (value: number) => void;
  onReserve: () => void;
  t: Translations['flights'];
  locale?: string;
};

function FlightBookingContent({
  detail,
  selectedClass,
  passengers,
  onPassengersChange,
  onReserve,
  t,
  locale,
}: FlightBookingSidebarProps) {
  const trustHints = useBookingSidebarTrustHints();
  const hasDate = Boolean(detail.departureDate);
  const canReserve = hasDate && selectedClass != null && selectedClass.availableSeats >= passengers;

  const passengersLabel =
    passengers === 1 ? t.passengerSingular : t.passengerPlural.replace('{n}', String(passengers));

  return (
    <BookingSidebarBody title={t.reserveSection}>
      {hasDate ? (
        <BookingSidebarDateCard
          label={t.departureDate}
          value={formatDisplayDate(detail.departureDate, locale)}
          detail={
            detail.returnDate
              ? `${t.returnDate}: ${formatDisplayDate(detail.returnDate, locale)}`
              : undefined
          }
        />
      ) : null}

      <BookingSidebarField label={t.passengers}>
        <input
          type="number"
          min={1}
          max={20}
          value={passengers}
          onChange={(e) =>
            onPassengersChange(Math.max(1, Number.parseInt(e.target.value, 10) || 1))
          }
          className={bookingSidebarInputClass}
        />
      </BookingSidebarField>

      {!selectedClass && (
        <BookingSidebarHint tone="warning">{t.selectClassHint}</BookingSidebarHint>
      )}

      {selectedClass && selectedClass.availableSeats < passengers && (
        <BookingSidebarHint tone="error">{t.insufficientSeats}</BookingSidebarHint>
      )}

      <BookingSidebarSummary>
        {detail.departureAirport.iataCode} → {detail.arrivalAirport.iataCode} · {passengersLabel}
      </BookingSidebarSummary>

      {selectedClass ? (
        <BookingSidebarPriceBlock
          label={t.totalFlight}
          amount={formatFlightPrice(selectedClass.totalPriceCents, detail.currency)}
        />
      ) : null}

      {!selectedClass && detail.minPriceCents > 0 && (
        <BookingSidebarHint>
          {t.fromPrice} {formatFlightPrice(detail.minPriceCents, detail.currency)} {t.perPassenger}
        </BookingSidebarHint>
      )}

      <BookingSidebarCta label={t.bookNow} disabled={!canReserve} onClick={onReserve} />
      <BookingSidebarTrustHints items={trustHints} />
    </BookingSidebarBody>
  );
}

export function FlightBookingSidebar(props: FlightBookingSidebarProps) {
  return (
    <BookingSidebarDesktop>
      <FlightBookingContent {...props} />
    </BookingSidebarDesktop>
  );
}

export function FlightBookingMobileBar(props: FlightBookingSidebarProps) {
  const { bookingSidebar } = useTranslations();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { detail, selectedClass, passengers, onReserve, t } = props;
  const canReserve =
    Boolean(detail.departureDate) &&
    selectedClass != null &&
    selectedClass.availableSeats >= passengers;

  useBookingDrawerOpenListener(() => setDrawerOpen(true));

  return (
    <>
      <BookingSidebarMobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t.reserveSection}
      >
        <FlightBookingContent {...props} />
      </BookingSidebarMobileDrawer>
      <BookingSidebarMobileBar
        priceLabel={selectedClass ? t.totalFlight : undefined}
        priceAmount={
          selectedClass
            ? formatFlightPrice(selectedClass.totalPriceCents, detail.currency)
            : undefined
        }
        hint={selectedClass ? undefined : t.selectClassHint}
        ctaLabel={t.bookNow}
        ctaDisabled={!canReserve}
        onCtaClick={onReserve}
        configureLabel={bookingSidebar.mobileConfigure}
        onConfigureClick={() => setDrawerOpen(true)}
      />
    </>
  );
}
