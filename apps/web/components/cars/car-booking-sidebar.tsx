'use client';

import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatCarPrice } from '../../lib/cars/listings';
import type { VehicleDetail } from '../../lib/cars/types';
import type { Translations } from '../../lib/i18n/message-types';
import { useState } from 'react';
import { useBookingCtaLabel } from '../../lib/bookings/use-booking-cta';
import { useTranslations } from 'next-intl';
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

type CarBookingSidebarProps = {
  detail: VehicleDetail;
  travelDate: string;
  onTravelDateChange: (value: string) => void;
  onReserve: () => void;
  t: Translations['cars'];
  locale?: string;
};

function CarBookingContent({
  detail,
  travelDate,
  onTravelDateChange,
  onReserve,
  t,
  locale,
}: CarBookingSidebarProps) {
  const trustHints = useBookingSidebarTrustHints();
  const ctaLabel = useBookingCtaLabel('vehicle');
  const hasDate = Boolean(travelDate);
  const canReserve = hasDate && Boolean(detail.availabilitySlot?.id) && Boolean(detail.route?.id);

  return (
    <BookingSidebarBody title={t.reserveSection}>
      <BookingSidebarField label={t.travelDate}>
        <input
          type="date"
          value={travelDate}
          onChange={(e) => onTravelDateChange(e.target.value)}
          className={bookingSidebarInputClass}
        />
      </BookingSidebarField>

      {!hasDate && <BookingSidebarHint>{t.selectDatesHint}</BookingSidebarHint>}

      {hasDate && (
        <BookingSidebarSummary>
          {detail.route.departureCity} → {detail.route.arrivalCity}
          {' · '}
          {formatDisplayDate(travelDate, locale)}
        </BookingSidebarSummary>
      )}

      {hasDate ? (
        <BookingSidebarPriceBlock
          label={t.totalRental}
          amount={formatCarPrice(detail.totalPriceCents, detail.currency)}
          detail={t.routePriceLabel}
        />
      ) : null}

      <BookingSidebarCta label={ctaLabel} disabled={!canReserve} onClick={onReserve} />
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
  const canReserve =
    hasDate &&
    Boolean(props.detail.availabilitySlot?.id) &&
    Boolean(props.detail.route?.id);

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
        ctaLabel={ctaLabel}
        ctaDisabled={!canReserve}
        onCtaClick={props.onReserve}
        configureLabel={tBooking('mobileConfigure')}
        onConfigureClick={() => setDrawerOpen(true)}
      />
    </>
  );
}
