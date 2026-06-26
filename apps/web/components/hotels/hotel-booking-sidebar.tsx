'use client';

import type { PropertyDetail, PropertyDetailRoom } from '@africatourismgate/types';
import { useState } from 'react';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatHotelPrice } from '../../lib/hotels/listings';
import { useTranslations } from '../../lib/i18n/locale-provider';
import type { Translations } from '../../lib/i18n/translations';
import {
  BookingSidebarBody,
  BookingSidebarCta,
  BookingSidebarDesktop,
  BookingSidebarField,
  BookingGuestStepper,
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
import { HOTEL_MAX_GUESTS } from '../../lib/hotels/listings';
import { useTranslations as useAppTranslations } from '../../lib/i18n/locale-provider';

type HotelBookingSidebarProps = {
  detail: PropertyDetail;
  selectedRoom: PropertyDetailRoom | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onGuestsChange: (value: number) => void;
  onReserve: () => void;
  t: Translations['hotels'];
  locale?: string;
};

function computeTotal(
  detail: PropertyDetail,
  selectedRoom: PropertyDetailRoom | null,
): { cents: number; currency: string; nights: number } | null {
  const nights = detail.stay.nights;
  if (selectedRoom?.totalPriceCents != null && selectedRoom.available) {
    return {
      cents: selectedRoom.totalPriceCents,
      currency: selectedRoom.currency,
      nights,
    };
  }
  if (detail.stay.minTotalCents != null && nights > 0) {
    return {
      cents: detail.stay.minTotalCents,
      currency: detail.stay.currency,
      nights,
    };
  }
  return null;
}

function HotelBookingContent({
  detail,
  selectedRoom,
  checkIn,
  checkOut,
  guests,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onReserve,
  t,
  locale,
}: HotelBookingSidebarProps) {
  const { bookingSidebar } = useAppTranslations();
  const trustHints = useBookingSidebarTrustHints();
  const hasDates = Boolean(checkIn && checkOut && checkOut > checkIn);
  const total = computeTotal(detail, selectedRoom);
  const canReserve = hasDates && selectedRoom != null && selectedRoom.available;
  const noRoomsForGuests = detail.rooms.length === 0;

  const nightsLabel =
    detail.stay.nights === 1 ? t.nightSingular : `${detail.stay.nights} ${t.nightPlural}`;
  const guestsLabel =
    guests === 1 ? t.guestSingular : t.guestPlural.replace('{n}', String(guests));

  return (
    <BookingSidebarBody title={t.reserveSection}>
      <div className={bookingSidebarDateGridClass}>
        <BookingSidebarField label={t.checkIn}>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => onCheckInChange(e.target.value)}
            className={bookingSidebarInputClass}
          />
        </BookingSidebarField>
        <BookingSidebarField label={t.checkOut}>
          <input
            type="date"
            value={checkOut}
            min={checkIn || undefined}
            onChange={(e) => onCheckOutChange(e.target.value)}
            className={bookingSidebarInputClass}
          />
        </BookingSidebarField>
      </div>

      <BookingSidebarField label={t.guests}>
        <BookingGuestStepper
          value={guests}
          min={1}
          max={HOTEL_MAX_GUESTS}
          onChange={onGuestsChange}
          decreaseLabel={bookingSidebar.decreaseGuests}
          increaseLabel={bookingSidebar.increaseGuests}
        />
      </BookingSidebarField>

      {!hasDates && <BookingSidebarHint>{t.selectDatesHint}</BookingSidebarHint>}

      {noRoomsForGuests && (
        <BookingSidebarHint tone="warning">
          {t.noRoomsForGuests.replace('{n}', String(guests))}
        </BookingSidebarHint>
      )}

      {!selectedRoom && hasDates && !noRoomsForGuests && (
        <BookingSidebarHint tone="warning">{t.selectRoomHint}</BookingSidebarHint>
      )}

      {hasDates && checkIn && checkOut && (
        <BookingSidebarSummary>
          {formatDisplayDate(checkIn, locale)} → {formatDisplayDate(checkOut, locale)}
          {detail.stay.nights > 0 && ` · ${nightsLabel}`}
          {` · ${guestsLabel}`}
        </BookingSidebarSummary>
      )}

      {total ? (
        <BookingSidebarPriceBlock
          label={t.totalStay}
          amount={formatHotelPrice(total.cents, total.currency)}
          detail={t.perRoomPriceNote}
        />
      ) : null}

      {!total && hasDates && (
        <BookingSidebarHint>
          {t.fromPrice}{' '}
          {formatHotelPrice(
            detail.rooms[0]?.basePriceCents ?? 0,
            detail.rooms[0]?.currency ?? detail.stay.currency,
          )}{' '}
          {t.perNight}
        </BookingSidebarHint>
      )}

      <BookingSidebarCta label={t.bookNow} disabled={!canReserve} onClick={onReserve} />
      <BookingSidebarTrustHints items={trustHints} />
    </BookingSidebarBody>
  );
}

export function HotelBookingSidebar(props: HotelBookingSidebarProps) {
  return (
    <BookingSidebarDesktop>
      <HotelBookingContent {...props} />
    </BookingSidebarDesktop>
  );
}

export function HotelBookingMobileBar(props: HotelBookingSidebarProps) {
  const { bookingSidebar } = useTranslations();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const total = computeTotal(props.detail, props.selectedRoom);
  const hasDates = Boolean(props.checkIn && props.checkOut && props.checkOut > props.checkIn);
  const canReserve =
    hasDates && props.selectedRoom != null && props.selectedRoom.available;

  useBookingDrawerOpenListener(() => setDrawerOpen(true));

  return (
    <>
      <BookingSidebarMobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={props.t.reserveSection}
      >
        <HotelBookingContent {...props} />
      </BookingSidebarMobileDrawer>
      <BookingSidebarMobileBar
        priceLabel={total ? props.t.totalStay : undefined}
        priceAmount={total ? formatHotelPrice(total.cents, total.currency) : undefined}
        hint={total ? undefined : props.t.selectDatesHint}
        ctaLabel={props.t.bookNow}
        ctaDisabled={!canReserve}
        onCtaClick={props.onReserve}
        configureLabel={bookingSidebar.mobileConfigure}
        onConfigureClick={() => setDrawerOpen(true)}
      />
    </>
  );
}
