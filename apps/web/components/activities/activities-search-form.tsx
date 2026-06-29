'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { type ActivitiesSearchParams } from '../../lib/activities/listings';
import { useActivityDestinations } from '../../lib/activities/use-activity-destinations';
import { todayISODate } from '../../lib/hotels/dates';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { buildSearchRoute } from '../../lib/search/route';
import {
  SearchFormDatalistInput,
  SearchFormInput,
  SearchFormLabel,
  SearchFormPanel,
  SearchFormSubmit,
} from '../shared';

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

    if (!date) {
      setError(s.toursRequired);
      return;
    }

    const params = new URLSearchParams();
    if (destination.trim()) params.set('destination', destination.trim());
    params.set('date', date);
    params.set('participants', String(Math.max(1, Number.parseInt(participants, 10) || 1)));

    router.push(buildSearchRoute('tours', params));
  }

  return (
    <SearchFormPanel id="activities-search" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_0.75fr_auto] lg:items-end">
        <div>
          <SearchFormLabel>{a.destination}</SearchFormLabel>
          <SearchFormDatalistInput
            name="destination"
            placeholder={
              destinationsLoading ? a.destinationsLoading : s.allDestinations
            }
            suggestions={destinationOptions}
            value={destination}
            disabled={destinationsLoading}
            onChange={(value) => {
              setDestination(value);
              setError(null);
            }}
          />
        </div>

        <div>
          <SearchFormLabel>{a.date}</SearchFormLabel>
          <SearchFormInput
            type="date"
            name="date"
            value={date}
            min={today}
            onChange={(value) => {
              setDate(value);
              setError(null);
            }}
          />
        </div>

        <div>
          <SearchFormLabel>{a.participants}</SearchFormLabel>
          <SearchFormInput
            type="number"
            name="participants"
            placeholder="2"
            value={participants}
            min="1"
            max="50"
            onChange={(value) => {
              setParticipants(value);
              setError(null);
            }}
          />
        </div>

        <div className="flex items-end">
          <SearchFormSubmit label={s.search} />
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
    </SearchFormPanel>
  );
}
