'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  buildCruisesSearchQuery,
  type CruisesSearchParams,
} from '../../lib/cruises/listings';
import { CRUISE_PORT_OPTIONS } from '../../lib/cruises/ports';
import { addDays, todayISODate } from '../../lib/hotels/dates';
import { useTranslations } from '../../lib/i18n/locale-provider';

type CruisesSearchFormProps = {
  initialValues: CruisesSearchParams;
};

export function CruisesSearchForm({ initialValues }: CruisesSearchFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const c = t.cruises;
  const s = t.search;

  const [sailFrom, setSailFrom] = useState(initialValues.sailFrom ?? '');
  const [sailTo, setSailTo] = useState(initialValues.sailTo ?? '');
  const [startDate, setStartDate] = useState(initialValues.startDate ?? '');
  const [endDate, setEndDate] = useState(initialValues.endDate ?? '');
  const [guests, setGuests] = useState(initialValues.guests ?? '2');
  const [error, setError] = useState<string | null>(null);

  const today = todayISODate();
  const endMinDate = startDate ? addDays(startDate, 1) : today;

  useEffect(() => {
    setSailFrom(initialValues.sailFrom ?? '');
    setSailTo(initialValues.sailTo ?? '');
    setStartDate(initialValues.startDate ?? '');
    setEndDate(initialValues.endDate ?? '');
    setGuests(initialValues.guests ?? '2');
    setError(null);
  }, [
    initialValues.sailFrom,
    initialValues.sailTo,
    initialValues.startDate,
    initialValues.endDate,
    initialValues.guests,
  ]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!sailFrom || !sailTo || !startDate || !endDate) {
      setError(c.searchRequired);
      return;
    }

    if (endDate <= startDate) {
      setError(c.endAfterStart);
      return;
    }

    const params: CruisesSearchParams = {
      sailFrom,
      sailTo,
      startDate,
      endDate,
      guests: String(Math.max(1, Number.parseInt(guests, 10) || 1)),
    };

    router.push(`/cruises${buildCruisesSearchQuery(params)}`);
  }

  const labelClass =
    'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-atg-muted';
  const fieldClass =
    'min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg dark:placeholder:text-atg-muted';

  return (
    <form
      id="cruises-search"
      onSubmit={handleSubmit}
      className="mt-8 rounded-xl border border-white/10 bg-white p-5 shadow-xl dark:border-atg-border dark:bg-atg-elevated sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
        <div>
          <label htmlFor="cruises-sail-from" className={labelClass}>
            {c.sailFrom}
          </label>
          <select
            id="cruises-sail-from"
            name="sailFrom"
            value={sailFrom}
            onChange={(event) => {
              setSailFrom(event.target.value);
              setError(null);
            }}
            className={fieldClass}
          >
            <option value="">{s.allPorts}</option>
            {CRUISE_PORT_OPTIONS.map((port) => (
              <option key={port.code} value={port.code}>
                {port.code} — {port.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cruises-sail-to" className={labelClass}>
            {c.sailTo}
          </label>
          <select
            id="cruises-sail-to"
            name="sailTo"
            value={sailTo}
            onChange={(event) => {
              setSailTo(event.target.value);
              setError(null);
            }}
            className={fieldClass}
          >
            <option value="">{s.allDestinations}</option>
            {CRUISE_PORT_OPTIONS.map((port) => (
              <option key={port.code} value={port.code}>
                {port.code} — {port.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cruises-start-date" className={labelClass}>
            {c.startDate}
          </label>
          <input
            id="cruises-start-date"
            type="date"
            name="startDate"
            value={startDate}
            min={today}
            onChange={(event) => {
              const value = event.target.value;
              setStartDate(value);
              if (endDate && value && endDate <= value) {
                setEndDate('');
              }
              setError(null);
            }}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="cruises-end-date" className={labelClass}>
            {c.endDate}
          </label>
          <input
            id="cruises-end-date"
            type="date"
            name="endDate"
            value={endDate}
            min={endMinDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              setError(null);
            }}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="cruises-guests" className={labelClass}>
            {c.guests}
          </label>
          <input
            id="cruises-guests"
            type="number"
            name="guests"
            min={1}
            max={20}
            value={guests}
            onChange={(event) => setGuests(event.target.value)}
            className={`${fieldClass} lg:mb-0`}
          />
        </div>

        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            className="min-h-[44px] w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
          >
            {s.search}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
