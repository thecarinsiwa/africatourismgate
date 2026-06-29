'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { type CruisesSearchParams } from '../../lib/cruises/listings';
import { CRUISE_PORT_OPTIONS } from '../../lib/cruises/ports';
import { addDays, todayISODate } from '../../lib/hotels/dates';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { buildSearchRoute } from '../../lib/search/route';
import {
  SearchFormInput,
  SearchFormLabel,
  SearchFormOptionDatalistInput,
  SearchFormPanel,
  SearchFormSubmit,
} from '../shared';

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

  const portOptions = useMemo(
    () => CRUISE_PORT_OPTIONS.map((port) => ({ value: port.code, label: `${port.code} — ${port.name}` })),
    [],
  );

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

    if (sailFrom === sailTo) {
      setError(s.cruisesSamePort);
      return;
    }

    if (endDate <= startDate) {
      setError(c.endAfterStart);
      return;
    }

    const params = new URLSearchParams({
      sailFrom,
      sailTo,
      startDate,
      endDate,
      guests: String(Math.max(1, Number.parseInt(guests, 10) || 1)),
    });

    router.push(buildSearchRoute('cruises', params));
  }

  return (
    <SearchFormPanel id="cruises-search" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_0.75fr_auto] lg:items-end">
        <div>
          <SearchFormLabel>{c.sailFrom}</SearchFormLabel>
          <SearchFormOptionDatalistInput
            name="sailFrom"
            placeholder={s.allPorts}
            options={portOptions}
            value={sailFrom}
            onChange={(value) => {
              setSailFrom(value);
              setError(null);
            }}
          />
        </div>

        <div>
          <SearchFormLabel>{c.sailTo}</SearchFormLabel>
          <SearchFormOptionDatalistInput
            name="sailTo"
            placeholder={s.allDestinations}
            options={portOptions}
            value={sailTo}
            onChange={(value) => {
              setSailTo(value);
              setError(null);
            }}
          />
        </div>

        <div>
          <SearchFormLabel>{c.startDate}</SearchFormLabel>
          <SearchFormInput
            type="date"
            name="startDate"
            value={startDate}
            min={today}
            onChange={(value) => {
              setStartDate(value);
              if (endDate && value && endDate <= value) {
                setEndDate('');
              }
              setError(null);
            }}
          />
        </div>

        <div>
          <SearchFormLabel>{c.endDate}</SearchFormLabel>
          <SearchFormInput
            type="date"
            name="endDate"
            value={endDate}
            min={endMinDate}
            onChange={(value) => {
              setEndDate(value);
              setError(null);
            }}
          />
        </div>

        <div>
          <SearchFormLabel>{c.guests}</SearchFormLabel>
          <SearchFormInput
            type="number"
            name="guests"
            value={guests}
            min="1"
            max="20"
            onChange={setGuests}
          />
        </div>

        <div className="flex items-end">
          <SearchFormSubmit label={s.search} />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </SearchFormPanel>
  );
}
