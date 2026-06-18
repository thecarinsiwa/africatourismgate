'use client';

import type { PropertyCalendarDay } from '@africatourismgate/types';
import type { Locale } from '../../lib/i18n/types';
import { formatHotelPrice } from '../../lib/hotels/listings';
import { enumerateMonthDays, formatMonthLabel, shiftYearMonth } from '../../lib/hotels/dates';

export type HotelCalendarLegendLabels = {
  title: string;
  available: string;
  selected: string;
  unavailable: string;
};

type HotelStayCalendarProps = {
  calendarDays: PropertyCalendarDay[];
  month: string;
  onMonthChange: (month: string) => void;
  checkIn: string | null;
  checkOut: string | null;
  onDatesChange: (checkIn: string, checkOut: string | null) => void;
  title: string;
  prevMonthLabel: string;
  nextMonthLabel: string;
  unavailableLabel: string;
  legendLabels: HotelCalendarLegendLabels;
  locale: Locale;
};

const WEEKDAY_HEADERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const;
const WEEKDAY_HEADERS_EN = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
const WEEKDAY_HEADERS_ES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

function weekdayHeaders(locale: Locale): readonly string[] {
  if (locale === 'en') return WEEKDAY_HEADERS_EN;
  if (locale === 'es') return WEEKDAY_HEADERS_ES;
  return WEEKDAY_HEADERS;
}

function dayByDate(days: PropertyCalendarDay[]): Map<string, PropertyCalendarDay> {
  return new Map(days.map((d) => [d.date, d]));
}

function isInRange(date: string, start: string | null, end: string | null): boolean {
  if (!start) return false;
  if (!end) return date === start;
  return date >= start && date <= end;
}

function CalendarLegend({ labels }: { labels: HotelCalendarLegendLabels }) {
  const items = [
    { key: 'available', label: labels.available, className: 'border-atg-border bg-atg-elevated' },
    { key: 'selected', label: labels.selected, className: 'bg-primary' },
    { key: 'unavailable', label: labels.unavailable, className: 'bg-atg-surface opacity-50' },
  ] as const;

  return (
    <div
      className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-atg-border pt-4 dark:border-atg-border"
      aria-label={labels.title}
    >
      <span className="w-full text-xs font-semibold uppercase tracking-wide text-atg-muted sm:w-auto sm:mr-1">
        {labels.title}
      </span>
      {items.map((item) => (
        <span key={item.key} className="inline-flex items-center gap-2 text-xs text-atg-muted">
          <span
            className={`h-4 w-4 shrink-0 rounded border ${item.className}`}
            aria-hidden
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function HotelStayCalendar({
  calendarDays,
  month,
  onMonthChange,
  checkIn,
  checkOut,
  onDatesChange,
  title,
  prevMonthLabel,
  nextMonthLabel,
  unavailableLabel,
  legendLabels,
  locale,
}: HotelStayCalendarProps) {
  const dayMap = dayByDate(calendarDays);
  const monthDays = enumerateMonthDays(month);
  const firstDay = monthDays[0];
  const startWeekday = new Date(`${firstDay}T12:00:00`).getUTCDay();
  const offset = startWeekday === 0 ? 6 : startWeekday - 1;
  const headers = weekdayHeaders(locale);

  function handleDayClick(date: string) {
    const day = dayMap.get(date);
    if (day && !day.available) return;

    if (!checkIn || (checkIn && checkOut)) {
      onDatesChange(date, null);
      return;
    }
    if (date <= checkIn) {
      onDatesChange(date, null);
      return;
    }
    onDatesChange(checkIn, date);
  }

  return (
    <section aria-label={title}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-atg-fg">{title}</h2>
        <div className="flex items-center justify-between gap-1 sm:justify-end">
          <button
            type="button"
            onClick={() => onMonthChange(shiftYearMonth(month, -1))}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-atg-border text-lg font-medium text-atg-fg transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-atg-border"
            aria-label={prevMonthLabel}
          >
            ‹
          </button>
          <span className="min-w-[9rem] flex-1 text-center text-sm font-semibold text-atg-fg sm:flex-none sm:min-w-[10rem] sm:text-base">
            {formatMonthLabel(month, locale)}
          </span>
          <button
            type="button"
            onClick={() => onMonthChange(shiftYearMonth(month, 1))}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-atg-border text-lg font-medium text-atg-fg transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-atg-border"
            aria-label={nextMonthLabel}
          >
            ›
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-atg-border bg-atg-elevated p-3 dark:border-atg-border dark:bg-atg-elevated sm:p-4">
        <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-atg-muted sm:gap-2 sm:text-sm">
          {headers.map((h, i) => (
            <span key={`${h}-${i}`} className="py-1">
              {h}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="grid" aria-readonly="false">
          {Array.from({ length: offset }, (_, i) => (
            <div key={`pad-${i}`} role="presentation" aria-hidden />
          ))}
          {monthDays.map((date) => {
            const day = dayMap.get(date);
            const selected =
              date === checkIn || date === checkOut || isInRange(date, checkIn, checkOut);
            const disabled = day ? !day.available : false;
            const dayNumber = Number(date.slice(8, 10));

            return (
              <button
                key={date}
                type="button"
                role="gridcell"
                disabled={disabled}
                onClick={() => handleDayClick(date)}
                aria-label={
                  disabled
                    ? `${dayNumber} — ${unavailableLabel}`
                    : selected
                      ? `${dayNumber} — ${legendLabels.selected}`
                      : `${dayNumber} — ${legendLabels.available}`
                }
                aria-selected={selected}
                className={`flex min-h-[3rem] min-w-0 flex-col items-center justify-center rounded-lg px-0.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:min-h-[3.5rem] sm:text-sm ${
                  selected
                    ? 'bg-primary text-white shadow-sm'
                    : disabled
                      ? 'cursor-not-allowed bg-atg-surface text-atg-muted/40 line-through dark:bg-atg-surface'
                      : 'border border-transparent bg-atg-surface/60 text-atg-fg hover:border-primary/30 hover:bg-atg-surface dark:bg-white/5 dark:hover:bg-white/10'
                }`}
              >
                <span className="text-sm font-semibold leading-none sm:text-base">{dayNumber}</span>
                {day && day.minPriceCents > 0 && !disabled ? (
                  <span
                    className={`mt-1 max-w-full truncate text-[10px] leading-tight sm:text-xs ${
                      selected ? 'text-white/90' : 'text-atg-muted'
                    }`}
                  >
                    {formatHotelPrice(day.minPriceCents, day.currency).replace(/\s/g, '\u00a0')}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <CalendarLegend labels={legendLabels} />
      </div>
    </section>
  );
}
