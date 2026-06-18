'use client';

import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatCruisePrice } from '../../lib/cruises/listings';
import { resolveCabinDeck } from '../../lib/cruises/cabins';
import { formatCruisePortLabel } from '../../lib/cruises/ports';
import type { CruiseCabinOffer, CruiseSailingDetail } from '../../lib/cruises/types';
import type { Translations } from '../../lib/i18n/translations';

type CruiseBookingSidebarProps = {
  detail: CruiseSailingDetail;
  selectedCabin: CruiseCabinOffer | null;
  guests: number;
  onGuestsChange: (value: number) => void;
  onReserve: () => void;
  t: Translations['cruises'];
  locale?: string;
};

function SidebarContent({
  detail,
  selectedCabin,
  guests,
  onGuestsChange,
  onReserve,
  t,
  locale,
}: CruiseBookingSidebarProps) {
  const canReserve =
    selectedCabin != null &&
    selectedCabin.availableCount > 0 &&
    selectedCabin.maxGuests >= guests;

  const guestsLabel =
    guests === 1 ? `1 ${t.guestSingular}` : t.guestPlural.replace('{n}', String(guests));

  const nightsLabel =
    detail.durationNights === 1
      ? `1 ${t.nightSingular}`
      : `${detail.durationNights} ${t.nightPlural}`;

  return (
    <div className="space-y-4" id="reserve">
      <h2 className="text-lg font-bold text-atg-fg">{t.reserveSection}</h2>

      <div className="rounded-lg bg-atg-surface px-4 py-3 text-sm dark:bg-atg-surface">
        <p className="text-xs uppercase tracking-wide text-atg-muted">
          {t.departure}
        </p>
        <p className="mt-1 font-medium text-atg-fg">
          {formatDisplayDate(detail.departureDate, locale)}
        </p>
        <p className="mt-2 text-xs text-atg-muted">
          {t.arrival}: {formatDisplayDate(detail.returnDate, locale)} · {nightsLabel}
        </p>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-atg-muted">{t.guests}</span>
        <input
          type="number"
          min={1}
          max={20}
          value={guests}
          onChange={(event) =>
            onGuestsChange(Math.max(1, Number.parseInt(event.target.value, 10) || 1))
          }
          className="min-h-[44px] w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg"
        />
      </label>

      {!selectedCabin && (
        <p className="text-sm text-amber-700 dark:text-amber-300">{t.selectCabinHint}</p>
      )}

      {selectedCabin && selectedCabin.availableCount <= 0 && (
        <p className="text-sm text-red-600 dark:text-red-400">{t.unavailable}</p>
      )}

      {selectedCabin && selectedCabin.maxGuests < guests && (
        <p className="text-sm text-red-600 dark:text-red-400">{t.insufficientCabins}</p>
      )}

      <p className="text-sm text-atg-muted">
        {formatCruisePortLabel(detail.sailFromPortCode, detail.sailFromPortName)} →{' '}
        {formatCruisePortLabel(detail.sailToPortCode, detail.sailToPortName)} · {guestsLabel}
      </p>

      {selectedCabin && (
        <div className="rounded-lg bg-atg-surface px-4 py-3 dark:bg-atg-surface">
          <p className="text-xs uppercase tracking-wide text-atg-muted">
            {selectedCabin.categoryName}
          </p>
          <p className="mt-1 text-xs text-atg-muted">
            {t.deckLabel}: {t.deck[resolveCabinDeck(selectedCabin.categoryName)]}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wide text-atg-muted">
            {t.totalCruise}
          </p>
          <p className="text-2xl font-bold text-atg-fg">
            {formatCruisePrice(selectedCabin.priceCents, detail.currency)}
          </p>
        </div>
      )}

      {!selectedCabin && detail.minPriceCents > 0 && (
        <p className="text-sm text-atg-muted">
          {t.fromPrice} {formatCruisePrice(detail.minPriceCents, detail.currency)} {t.perGuest}
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
    </div>
  );
}

export function CruiseBookingSidebar(props: CruiseBookingSidebarProps) {
  return (
    <aside className="hidden rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-lg dark:border-atg-border dark:bg-atg-elevated lg:block lg:sticky lg:top-24">
      <SidebarContent {...props} />
    </aside>
  );
}

export function CruiseBookingMobileBar(props: CruiseBookingSidebarProps) {
  const { detail, selectedCabin, guests, onReserve, t } = props;
  const canReserve =
    selectedCabin != null &&
    selectedCabin.availableCount > 0 &&
    selectedCabin.maxGuests >= guests;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-atg-border bg-atg-elevated/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95 lg:hidden pb-safe">
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="min-w-0 flex-1">
          {selectedCabin ? (
            <>
              <p className="text-xs text-atg-muted">{t.totalCruise}</p>
              <p className="text-lg font-bold text-atg-fg">
                {formatCruisePrice(selectedCabin.priceCents, detail.currency)}
              </p>
            </>
          ) : (
            <p className="text-sm text-atg-muted">{t.selectCabinHint}</p>
          )}
        </div>
        <button
          type="button"
          disabled={!canReserve}
          onClick={onReserve}
          className="min-h-[48px] shrink-0 rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {t.bookNow}
        </button>
      </div>
    </div>
  );
}
