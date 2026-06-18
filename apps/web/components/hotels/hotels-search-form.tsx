'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { listPublicDestinations } from '../../lib/api/public';
import { addDays, todayISODate } from '../../lib/hotels/dates';
import type { HotelsSearchParams } from '../../lib/hotels/listings';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { buildSearchRoute } from '../../lib/search/route';
import {
  SearchFormInput,
  SearchFormLabel,
  SearchFormPanel,
  SearchFormSelect,
  SearchFormSubmit,
} from '../shared';

const AFRICAN_CITIES = [
  'Nairobi', 'Le Cap', 'Marrakech', 'Zanzibar', 'Kigali',
  'Lagos', 'Accra', 'Le Caire', 'Dakar', 'Casablanca',
  'Addis-Abeba', 'Dar es Salaam', 'Kampala', 'Kinshasa',
];

type HotelsSearchFormProps = {
  initialValues: HotelsSearchParams;
};

export function HotelsSearchForm({ initialValues }: HotelsSearchFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const h = t.hotels;
  const s = t.search;

  const [destination, setDestination] = useState(initialValues.destination ?? '');
  const [checkIn, setCheckIn] = useState(initialValues.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(initialValues.checkOut ?? '');
  const [guests, setGuests] = useState(initialValues.guests ?? '2');
  const [error, setError] = useState<string | null>(null);
  const [destinationOptions, setDestinationOptions] = useState<string[]>(AFRICAN_CITIES);

  const today = todayISODate();
  const checkOutMinDate = checkIn ? addDays(checkIn, 1) : today;

  useEffect(() => {
    let cancelled = false;
    void listPublicDestinations()
      .then((dests) => {
        if (cancelled || !dests.length) return;
        const names = dests.map((d) => d.name);
        const merged = Array.from(new Set([...names, ...AFRICAN_CITIES])).sort((a, b) =>
          a.localeCompare(b),
        );
        setDestinationOptions(merged);
      })
      .catch(() => {
        /* keep static fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setDestination(initialValues.destination ?? '');
    setCheckIn(initialValues.checkIn ?? '');
    setCheckOut(initialValues.checkOut ?? '');
    setGuests(initialValues.guests ?? '2');
    setError(null);
  }, [
    initialValues.destination,
    initialValues.checkIn,
    initialValues.checkOut,
    initialValues.guests,
  ]);

  const nightsLabel = useMemo(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return null;
    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    if (nights <= 0) return null;
    return nights === 1 ? `1 ${h.nightSingular}` : `${nights} ${h.nightPlural}`;
  }, [checkIn, checkOut, h.nightSingular, h.nightPlural]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (checkIn && checkOut && checkOut <= checkIn) {
      setError(s.cruisesEndAfterStart);
      return;
    }

    const params = new URLSearchParams();
    if (destination.trim()) params.set('destination', destination.trim());
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);

    router.push(buildSearchRoute('hotels', params));
  }

  return (
    <SearchFormPanel id="hotels-search" onSubmit={handleSubmit}>
      {nightsLabel ? (
        <p className="mb-4 text-sm text-atg-muted" role="status">
          {nightsLabel}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.25fr_0.75fr_auto] lg:items-end">
        <div>
          <SearchFormLabel>{s.checkIn}</SearchFormLabel>
          <SearchFormInput
            type="date"
            name="checkIn"
            value={checkIn}
            min={today}
            onChange={(value) => {
              setCheckIn(value);
              if (checkOut && value && checkOut <= value) {
                setCheckOut('');
              }
              setError(null);
            }}
          />
        </div>

        <div>
          <SearchFormLabel>{s.checkOut}</SearchFormLabel>
          <SearchFormInput
            type="date"
            name="checkOut"
            value={checkOut}
            min={checkOutMinDate}
            onChange={(value) => {
              setCheckOut(value);
              setError(null);
            }}
          />
        </div>

        <div>
          <SearchFormLabel>{s.destination}</SearchFormLabel>
          <SearchFormSelect
            name="destination"
            placeholder={s.destinationPh}
            options={destinationOptions}
            value={destination}
            onChange={(value) => {
              setDestination(value);
              setError(null);
            }}
          />
        </div>

        <div>
          <SearchFormLabel>{h.guests}</SearchFormLabel>
          <SearchFormInput
            type="number"
            name="guests"
            placeholder="2"
            value={guests}
            min="1"
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
