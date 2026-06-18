'use client';

import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatCarPrice } from '../../lib/cars/listings';
import type { VehicleDetail } from '../../lib/cars/types';
import type { Translations } from '../../lib/i18n/translations';

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

function SidebarContent({
  detail,
  pickupDate,
  returnDate,
  onPickupDateChange,
  onReturnDateChange,
  onReserve,
  t,
  locale,
}: CarBookingSidebarProps) {
  const hasDates = Boolean(pickupDate && returnDate && returnDate > pickupDate);
  const canReserve = hasDates && Boolean(detail.availabilitySlot?.id);
  const daysLabel =
    detail.rentalDays === 1
      ? `1 ${t.daySingular}`
      : `${detail.rentalDays} ${t.dayPlural}`;

  return (
    <div className="space-y-4" id="reserve">
      <h2 className="text-lg font-bold text-atg-fg">{t.reserveSection}</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-atg-muted">
            {t.pickupDate}
          </span>
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => onPickupDateChange(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-atg-muted">
            {t.returnDate}
          </span>
          <input
            type="date"
            value={returnDate}
            min={pickupDate || undefined}
            onChange={(e) => onReturnDateChange(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg"
          />
        </label>
      </div>

      {!hasDates && (
        <p className="text-sm text-atg-muted">{t.selectDatesHint}</p>
      )}

      {hasDates && (
        <p className="text-sm text-atg-muted">
          {formatDisplayDate(pickupDate, locale)} → {formatDisplayDate(returnDate, locale)} ·{' '}
          {daysLabel}
        </p>
      )}

      {hasDates && (
        <div className="rounded-lg bg-atg-surface px-4 py-3 dark:bg-atg-surface">
          <p className="text-xs uppercase tracking-wide text-atg-muted">
            {t.totalRental}
          </p>
          <p className="text-2xl font-bold text-atg-fg">
            {formatCarPrice(detail.totalPriceCents, detail.currency)}
          </p>
          <p className="mt-1 text-xs text-atg-muted">
            {formatCarPrice(detail.dailyPriceCents, detail.currency)} {t.perDay}
          </p>
        </div>
      )}

      <button
        type="button"
        disabled={!canReserve}
        onClick={onReserve}
        className="w-full min-h-[48px] rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t.bookNow}
      </button>
    </div>
  );
}

export function CarBookingSidebar(props: CarBookingSidebarProps) {
  return (
    <aside className="hidden rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-lg dark:border-atg-border dark:bg-atg-elevated lg:block lg:sticky lg:top-24">
      <SidebarContent {...props} />
    </aside>
  );
}

export function CarBookingMobileBar(props: CarBookingSidebarProps) {
  const hasDates = Boolean(
    props.pickupDate && props.returnDate && props.returnDate > props.pickupDate,
  );
  const canReserve = hasDates && Boolean(props.detail.availabilitySlot?.id);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-atg-border bg-atg-elevated/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95 lg:hidden pb-safe">
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="min-w-0 flex-1">
          {hasDates ? (
            <>
              <p className="text-xs text-atg-muted">{props.t.totalRental}</p>
              <p className="text-lg font-bold text-atg-fg">
                {formatCarPrice(props.detail.totalPriceCents, props.detail.currency)}
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
