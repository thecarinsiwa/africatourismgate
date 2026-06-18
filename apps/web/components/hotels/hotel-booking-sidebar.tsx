'use client';

import type { PropertyDetail, PropertyDetailRoom } from '@africatourismgate/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatHotelPrice } from '../../lib/hotels/listings';
import type { Translations } from '../../lib/i18n/translations';

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

function SidebarContent({
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
  const hasDates = Boolean(checkIn && checkOut && checkOut > checkIn);
  const total = computeTotal(detail, selectedRoom);
  const canReserve = hasDates && selectedRoom != null && selectedRoom.available;

  const nightsLabel =
    detail.stay.nights === 1 ? t.nightSingular : `${detail.stay.nights} ${t.nightPlural}`;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-atg-fg">{t.reserveSection}</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-atg-muted">{t.checkIn}</span>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => onCheckInChange(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-atg-muted">{t.checkOut}</span>
          <input
            type="date"
            value={checkOut}
            min={checkIn || undefined}
            onChange={(e) => onCheckOutChange(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-atg-muted">{t.guests}</span>
        <input
          type="number"
          min={1}
          max={20}
          value={guests}
          onChange={(e) => onGuestsChange(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
          className="min-h-[44px] w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg"
        />
      </label>

      {!hasDates && (
        <p className="text-sm text-atg-muted">{t.selectDatesHint}</p>
      )}

      {!selectedRoom && hasDates && (
        <p className="text-sm text-amber-700 dark:text-amber-300">{t.selectRoomHint}</p>
      )}

      {hasDates && checkIn && checkOut && (
        <p className="text-sm text-atg-muted">
          {formatDisplayDate(checkIn, locale)} → {formatDisplayDate(checkOut, locale)}
          {detail.stay.nights > 0 && ` · ${nightsLabel}`}
        </p>
      )}

      {total && (
        <div className="rounded-lg bg-atg-surface px-4 py-3 dark:bg-white/5">
          <p className="text-xs uppercase tracking-wide text-atg-muted">
            {t.totalStay}
          </p>
          <p className="text-2xl font-bold text-atg-fg">
            {formatHotelPrice(total.cents, total.currency)}
          </p>
        </div>
      )}

      {!total && hasDates && (
        <p className="text-sm text-atg-muted">
          {t.fromPrice}{' '}
          {formatHotelPrice(
            detail.rooms[0]?.basePriceCents ?? 0,
            detail.rooms[0]?.currency ?? detail.stay.currency,
          )}{' '}
          {t.perNight}
        </p>
      )}

      <button
        type="button"
        disabled={!canReserve}
        onClick={onReserve}
        className="w-full min-h-[48px] rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t.bookNow}
      </button>

      <p className="text-xs text-atg-muted">{t.previewNotice}</p>
    </div>
  );
}

export function HotelBookingSidebar(props: HotelBookingSidebarProps) {
  return (
    <aside
      id="reserve"
      className="hidden rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-lg dark:border-atg-border dark:bg-atg-elevated lg:block lg:sticky lg:top-24"
    >
      <SidebarContent {...props} />
    </aside>
  );
}

export function HotelBookingMobileBar(props: HotelBookingSidebarProps) {
  const total = computeTotal(props.detail, props.selectedRoom);
  const hasDates = Boolean(props.checkIn && props.checkOut && props.checkOut > props.checkIn);
  const canReserve =
    hasDates && props.selectedRoom != null && props.selectedRoom.available;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-atg-border bg-atg-elevated/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95 lg:hidden pb-safe">
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="min-w-0 flex-1">
          {total ? (
            <>
              <p className="text-xs text-atg-muted">{props.t.totalStay}</p>
              <p className="text-lg font-bold text-atg-fg">
                {formatHotelPrice(total.cents, total.currency)}
              </p>
            </>
          ) : (
            <p className="text-sm text-atg-muted">{props.t.selectDatesHint}</p>
          )}
        </div>
        <button
          type="button"
          disabled={!canReserve}
          onClick={props.onReserve}
          className="min-h-[48px] shrink-0 rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {props.t.bookNow}
        </button>
      </div>
    </div>
  );
}
