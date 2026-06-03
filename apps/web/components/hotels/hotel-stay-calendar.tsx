'use client';

import type { PropertyCalendarDay } from '@africatourismgate/types';
import type { Locale } from '../../lib/i18n/types';
import { formatHotelPrice } from '../../lib/hotels/listings';
import { enumerateMonthDays, formatMonthLabel, shiftYearMonth } from '../../lib/hotels/dates';

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
    <section>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-[#0f1a16] dark:text-white">{title}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMonthChange(shiftYearMonth(month, -1))}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-gray-200 text-sm font-medium hover:border-primary dark:border-atg-border"
            aria-label={prevMonthLabel}
          >
            ‹
          </button>
          <span className="min-w-[8rem] text-center text-sm font-semibold text-[#0f1a16] dark:text-white">
            {formatMonthLabel(month, locale)}
          </span>
          <button
            type="button"
            onClick={() => onMonthChange(shiftYearMonth(month, 1))}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-gray-200 text-sm font-medium hover:border-primary dark:border-atg-border"
            aria-label={nextMonthLabel}
          >
            ›
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-3 dark:border-atg-border dark:bg-atg-elevated sm:p-4">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 dark:text-atg-muted">
          {headers.map((h, i) => (
            <span key={`${h}-${i}`}>{h}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset }, (_, i) => (
            <div key={`pad-${i}`} aria-hidden />
          ))}
          {monthDays.map((date) => {
            const day = dayMap.get(date);
            const selected =
              date === checkIn || date === checkOut || isInRange(date, checkIn, checkOut);
            const disabled = day ? !day.available : false;

            return (
              <button
                key={date}
                type="button"
                disabled={disabled}
                onClick={() => handleDayClick(date)}
                className={`flex min-h-[52px] flex-col items-center justify-center rounded-lg p-1 text-xs transition-colors sm:min-h-[56px] ${
                  selected
                    ? 'bg-primary text-white'
                    : disabled
                      ? 'cursor-not-allowed text-gray-300 dark:text-atg-muted/50'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <span className="font-semibold">{Number(date.slice(8, 10))}</span>
                {day && day.minPriceCents > 0 && (
                  <span className={`mt-0.5 text-[10px] leading-tight ${selected ? 'text-white/90' : 'text-gray-500 dark:text-atg-muted'}`}>
                    {formatHotelPrice(day.minPriceCents, day.currency).replace(/\s/g, '\u00a0')}
                  </span>
                )}
                {disabled && (
                  <span className="sr-only">{unavailableLabel}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
