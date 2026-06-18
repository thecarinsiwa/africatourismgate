'use client';

import type { PropertyDetail, PropertyDetailRoom } from '@africatourismgate/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatHotelPrice } from '../../lib/hotels/listings';
import type { Translations } from '../../lib/i18n/translations';
import {
  BookingSidebarBody,
  BookingSidebarCta,
  BookingSidebarDesktop,
  BookingSidebarField,
  BookingSidebarHint,
  BookingSidebarMobileBar,
  BookingSidebarPriceBlock,
  BookingSidebarSummary,
  BookingSidebarTrustHints,
  bookingSidebarDateGridClass,
  bookingSidebarInputClass,
  useBookingSidebarTrustHints,
} from '../shared/booking-sidebar-shell';

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
  const trustHints = useBookingSidebarTrustHints();
  const hasDates = Boolean(checkIn && checkOut && checkOut > checkIn);
  const total = computeTotal(detail, selectedRoom);
  const canReserve = hasDates && selectedRoom != null && selectedRoom.available;

  const nightsLabel =
    detail.stay.nights === 1 ? t.nightSingular : `${detail.stay.nights} ${t.nightPlural}`;

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
        <input
          type="number"
          min={1}
          max={20}
          value={guests}
          onChange={(e) => onGuestsChange(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
          className={bookingSidebarInputClass}
        />
      </BookingSidebarField>

      {!hasDates && <BookingSidebarHint>{t.selectDatesHint}</BookingSidebarHint>}

      {!selectedRoom && hasDates && (
        <BookingSidebarHint tone="warning">{t.selectRoomHint}</BookingSidebarHint>
      )}

      {hasDates && checkIn && checkOut && (
        <BookingSidebarSummary>
          {formatDisplayDate(checkIn, locale)} → {formatDisplayDate(checkOut, locale)}
          {detail.stay.nights > 0 && ` · ${nightsLabel}`}
        </BookingSidebarSummary>
      )}

      {total ? (
        <BookingSidebarPriceBlock
          label={t.totalStay}
          amount={formatHotelPrice(total.cents, total.currency)}
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
  const total = computeTotal(props.detail, props.selectedRoom);
  const hasDates = Boolean(props.checkIn && props.checkOut && props.checkOut > props.checkIn);
  const canReserve =
    hasDates && props.selectedRoom != null && props.selectedRoom.available;

  return (
    <BookingSidebarMobileBar
      priceLabel={total ? props.t.totalStay : undefined}
      priceAmount={total ? formatHotelPrice(total.cents, total.currency) : undefined}
      hint={total ? undefined : props.t.selectDatesHint}
      ctaLabel={props.t.bookNow}
      ctaDisabled={!canReserve}
      onCtaClick={props.onReserve}
    />
  );
}
