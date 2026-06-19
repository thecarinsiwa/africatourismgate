'use client';

import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatCarPrice } from '../../lib/cars/listings';
import type { VehicleDetail } from '../../lib/cars/types';
import type { Translations } from '../../lib/i18n/translations';
import { useState } from 'react';
import { useTranslations } from '../../lib/i18n/locale-provider';
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
  bookingSidebarDateGridClass,
  bookingSidebarInputClass,
  useBookingDrawerOpenListener,
  useBookingSidebarTrustHints,
} from '../shared/booking-sidebar-shell';

type CarBookingSidebarProps = {
  detail: VehicleDetail;
  pickupDate: string;
  returnDate: string;
  onPickupDateChange: (value: string) => void;
  onReturnDateChange: (value: string) => void;
  onReserve: () => void;
  t: Translations['cars'];
  locale?: string;
};

function CarBookingContent({
  detail,
  pickupDate,
  returnDate,
  onPickupDateChange,
  onReturnDateChange,
  onReserve,
  t,
  locale,
}: CarBookingSidebarProps) {
  const trustHints = useBookingSidebarTrustHints();
  const hasDates = Boolean(pickupDate && returnDate && returnDate > pickupDate);
  const canReserve = hasDates && Boolean(detail.availabilitySlot?.id);
  const daysLabel =
    detail.rentalDays === 1 ? `1 ${t.daySingular}` : `${detail.rentalDays} ${t.dayPlural}`;

  return (
    <BookingSidebarBody title={t.reserveSection}>
      <div className={bookingSidebarDateGridClass}>
        <BookingSidebarField label={t.pickupDate}>
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => onPickupDateChange(e.target.value)}
            className={bookingSidebarInputClass}
          />
        </BookingSidebarField>
        <BookingSidebarField label={t.returnDate}>
          <input
            type="date"
            value={returnDate}
            min={pickupDate || undefined}
            onChange={(e) => onReturnDateChange(e.target.value)}
            className={bookingSidebarInputClass}
          />
        </BookingSidebarField>
      </div>

      {!hasDates && <BookingSidebarHint>{t.selectDatesHint}</BookingSidebarHint>}

      {hasDates && (
        <BookingSidebarSummary>
          {formatDisplayDate(pickupDate, locale)} → {formatDisplayDate(returnDate, locale)} ·{' '}
          {daysLabel}
        </BookingSidebarSummary>
      )}

      {hasDates ? (
        <BookingSidebarPriceBlock
          label={t.totalRental}
          amount={formatCarPrice(detail.totalPriceCents, detail.currency)}
          detail={`${formatCarPrice(detail.dailyPriceCents, detail.currency)} ${t.perDay}`}
        />
      ) : null}

      <BookingSidebarCta label={t.bookNow} disabled={!canReserve} onClick={onReserve} />
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
  const { bookingSidebar } = useTranslations();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hasDates = Boolean(
    props.pickupDate && props.returnDate && props.returnDate > props.pickupDate,
  );
  const canReserve = hasDates && Boolean(props.detail.availabilitySlot?.id);

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
        priceLabel={hasDates ? props.t.totalRental : undefined}
        priceAmount={
          hasDates
            ? formatCarPrice(props.detail.totalPriceCents, props.detail.currency)
            : undefined
        }
        hint={hasDates ? undefined : props.t.selectDatesHint}
        ctaLabel={props.t.bookNow}
        ctaDisabled={!canReserve}
        onCtaClick={props.onReserve}
        configureLabel={bookingSidebar.mobileConfigure}
        onConfigureClick={() => setDrawerOpen(true)}
      />
    </>
  );
}
