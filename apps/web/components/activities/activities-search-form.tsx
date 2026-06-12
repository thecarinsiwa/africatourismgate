'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  buildActivitiesSearchQuery,
  type ActivitiesSearchParams,
} from '../../lib/activities/listings';
import { useActivityDestinations } from '../../lib/activities/use-activity-destinations';
import { todayISODate } from '../../lib/hotels/dates';
import { useTranslations } from '../../lib/i18n/locale-provider';

type ActivitiesSearchFormProps = {
  initialValues: ActivitiesSearchParams;
};

export function ActivitiesSearchForm({ initialValues }: ActivitiesSearchFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const a = t.activities;
  const s = t.search;
  const {
    destinations,
    loading: destinationsLoading,
    error: destinationsError,
  } = useActivityDestinations();
  const destinationOptions = useMemo(
    () => destinations.map((row) => row.name),
    [destinations],
  );

  const [destination, setDestination] = useState(initialValues.destination ?? '');
  const [date, setDate] = useState(initialValues.date ?? '');
  const [participants, setParticipants] = useState(initialValues.participants ?? '2');
  const [error, setError] = useState<string | null>(null);

  const today = todayISODate();

  useEffect(() => {
    setDestination(initialValues.destination ?? '');
    setDate(initialValues.date ?? '');
    setParticipants(initialValues.participants ?? '2');
    setError(null);
  }, [initialValues.destination, initialValues.date, initialValues.participants]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const params: ActivitiesSearchParams = {
      destination: destination.trim() || undefined,
      date: date || undefined,
      participants: String(Math.max(1, Number.parseInt(participants, 10) || 1)),
    };

    if (!params.date && !params.destination) {
      router.push('/activities');
      return;
    }

    router.push(`/activities${buildActivitiesSearchQuery(params)}`);
  }

  const labelClass =
    'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-atg-muted';
  const fieldClass =
    'min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg dark:placeholder:text-atg-muted';

  return (
    <form
      id="activities-search"
      onSubmit={handleSubmit}
      className="mt-8 rounded-xl border border-white/10 bg-white p-5 shadow-xl dark:border-atg-border dark:bg-atg-elevated sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
        <div>
          <label htmlFor="activities-destination" className={labelClass}>
            {a.destination}
          </label>
          <select
            id="activities-destination"
            name="destination"
            value={destination}
            disabled={destinationsLoading || destinationOptions.length === 0}
            onChange={(event) => {
              setDestination(event.target.value);
              setError(null);
            }}
            className={fieldClass}
          >
            <option value="">
              {destinationsLoading ? a.destinationsLoading : s.allDestinations}
            </option>
            {destinationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="activities-date" className={labelClass}>
            {a.date}
          </label>
          <input
            id="activities-date"
            type="date"
            name="date"
            value={date}
            min={today}
            onChange={(event) => {
              setDate(event.target.value);
              setError(null);
            }}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="activities-participants" className={labelClass}>
            {a.participants}
          </label>
          <input
            id="activities-participants"
            type="number"
            name="participants"
            min={1}
            max={50}
            value={participants}
            onChange={(event) => setParticipants(event.target.value)}
            className={fieldClass}
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

      {destinationsError && (
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-300" role="status">
          {a.destinationsLoadError}
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
