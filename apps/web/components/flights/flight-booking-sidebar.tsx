'use client';

import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatFlightPrice } from '../../lib/flights/listings';
import type { FlightDetail, FlightDetailClass } from '../../lib/flights/types';
import type { Translations } from '../../lib/i18n/translations';

type FlightBookingSidebarProps = {
  detail: FlightDetail;
  selectedClass: FlightDetailClass | null;
  passengers: number;
  onPassengersChange: (value: number) => void;
  onReserve: () => void;
  t: Translations['flights'];
  locale?: string;
};

function SidebarContent({
  detail,
  selectedClass,
  passengers,
  onPassengersChange,
  onReserve,
  t,
  locale,
}: FlightBookingSidebarProps) {
  const hasDate = Boolean(detail.departureDate);
  const canReserve = hasDate && selectedClass != null && selectedClass.availableSeats >= passengers;

  const passengersLabel =
    passengers === 1 ? t.passengerSingular : t.passengerPlural.replace('{n}', String(passengers));

  return (
    <div className="space-y-4" id="reserve">
      <h2 className="text-lg font-bold text-[#0f1a16] dark:text-white">{t.reserveSection}</h2>

      {hasDate && (
        <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm dark:bg-white/5">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-atg-muted">
            {t.departureDate}
          </p>
          <p className="mt-1 font-medium text-[#0f1a16] dark:text-white">
            {formatDisplayDate(detail.departureDate, locale)}
          </p>
          {detail.returnDate && (
            <p className="mt-2 text-xs text-gray-500 dark:text-atg-muted">
              {t.returnDate}: {formatDisplayDate(detail.returnDate, locale)}
            </p>
          )}
        </div>
      )}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
          {t.passengers}
        </span>
        <input
          type="number"
          min={1}
          max={20}
          value={passengers}
          onChange={(e) =>
            onPassengersChange(Math.max(1, Number.parseInt(e.target.value, 10) || 1))
          }
          className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
        />
      </label>

      {!selectedClass && (
        <p className="text-sm text-amber-700 dark:text-amber-300">{t.selectClassHint}</p>
      )}

      {selectedClass && selectedClass.availableSeats < passengers && (
        <p className="text-sm text-red-600 dark:text-red-400">{t.insufficientSeats}</p>
      )}

      <p className="text-sm text-gray-600 dark:text-atg-muted">
        {detail.departureAirport.iataCode} → {detail.arrivalAirport.iataCode} · {passengersLabel}
      </p>

      {selectedClass && (
        <div className="rounded-lg bg-gray-50 px-4 py-3 dark:bg-white/5">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-atg-muted">
            {t.totalFlight}
          </p>
          <p className="text-2xl font-bold text-[#0f1a16] dark:text-white">
            {formatFlightPrice(selectedClass.totalPriceCents, detail.currency)}
          </p>
        </div>
      )}

      {!selectedClass && detail.minPriceCents > 0 && (
        <p className="text-sm text-gray-500 dark:text-atg-muted">
          {t.fromPrice}{' '}
          {formatFlightPrice(detail.minPriceCents, detail.currency)} {t.perPassenger}
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

export function FlightBookingSidebar(props: FlightBookingSidebarProps) {
  return (
    <aside className="hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-atg-border dark:bg-atg-elevated lg:block lg:sticky lg:top-24">
      <SidebarContent {...props} />
    </aside>
  );
}

export function FlightBookingMobileBar(props: FlightBookingSidebarProps) {
  const { detail, selectedClass, passengers, onReserve, t } = props;
  const canReserve =
    Boolean(detail.departureDate) &&
    selectedClass != null &&
    selectedClass.availableSeats >= passengers;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95 lg:hidden pb-safe">
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="min-w-0 flex-1">
          {selectedClass ? (
            <>
              <p className="text-xs text-gray-500 dark:text-atg-muted">{t.totalFlight}</p>
              <p className="text-lg font-bold text-[#0f1a16] dark:text-white">
                {formatFlightPrice(selectedClass.totalPriceCents, detail.currency)}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-atg-muted">{t.selectClassHint}</p>
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
