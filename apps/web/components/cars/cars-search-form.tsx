'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  buildCarsSearchQuery,
  countRentalDays,
  type CarsSearchParams,
} from '../../lib/cars/listings';
import { useVehiclePickupLocations } from '../../lib/cars/use-vehicle-pickup-locations';
import { addDays, todayISODate } from '../../lib/hotels/dates';
import { useTranslations } from '../../lib/i18n/locale-provider';

type CarsSearchFormProps = {
  initialValues: CarsSearchParams;
};

export function CarsSearchForm({ initialValues }: CarsSearchFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const c = t.cars;
  const s = t.search;

  const [pickupLocation, setPickupLocation] = useState(initialValues.pickupLocation ?? '');
  const [pickupDate, setPickupDate] = useState(initialValues.pickupDate ?? '');
  const [returnDate, setReturnDate] = useState(initialValues.returnDate ?? '');
  const [error, setError] = useState<string | null>(null);

  const {
    locations: carPickupLocations,
    loading: carPickupLoading,
    error: carPickupError,
  } = useVehiclePickupLocations();

  const today = todayISODate();
  const returnMinDate = pickupDate ? addDays(pickupDate, 1) : today;

  const rentalDaysLabel = useMemo(() => {
    if (!pickupDate || !returnDate || returnDate <= pickupDate) return null;
    const days = countRentalDays(pickupDate, returnDate);
    return days === 1 ? `1 ${c.daySingular}` : `${days} ${c.dayPlural}`;
  }, [pickupDate, returnDate, c.daySingular, c.dayPlural]);

  useEffect(() => {
    setPickupLocation(initialValues.pickupLocation ?? '');
    setPickupDate(initialValues.pickupDate ?? '');
    setReturnDate(initialValues.returnDate ?? '');
    setError(null);
  }, [initialValues.pickupLocation, initialValues.pickupDate, initialValues.returnDate]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const hasPartialDates = Boolean(pickupDate) !== Boolean(returnDate);
    if (hasPartialDates) {
      setError(s.carsRequired);
      return;
    }

    if (pickupDate && returnDate && returnDate <= pickupDate) {
      setError(s.carsReturnAfterPickup);
      return;
    }

    const params: CarsSearchParams = {};
    if (pickupLocation.trim()) params.pickupLocation = pickupLocation.trim();
    if (pickupDate) params.pickupDate = pickupDate;
    if (returnDate) params.returnDate = returnDate;

    router.push(`/cars${buildCarsSearchQuery(params)}`);
  }

  const labelClass =
    'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-atg-muted';
  const fieldClass =
    'min-h-[44px] w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg transition-colors placeholder:text-atg-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg dark:placeholder:text-atg-muted';

  return (
    <form
      id="cars-search"
      onSubmit={handleSubmit}
      className="mt-8 rounded-xl border border-white/10 bg-white p-5 shadow-xl dark:border-atg-border dark:bg-atg-elevated sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {rentalDaysLabel ? (
          <span
            className="inline-flex min-h-[36px] items-center rounded-lg border border-atg-border bg-atg-surface px-3 py-1.5 text-sm font-semibold text-atg-fg dark:border-atg-border dark:bg-atg-surface dark:text-white"
            role="status"
          >
            {rentalDaysLabel}
          </span>
        ) : (
          <span className="text-sm text-atg-muted">{s.carsDurationHint}</span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_auto] lg:items-end">
        <div>
          <label htmlFor="cars-pickup-location" className={labelClass}>
            {c.pickupLocation}
          </label>
          <select
            id="cars-pickup-location"
            name="pickupLocation"
            value={pickupLocation}
            disabled={carPickupLoading}
            onChange={(event) => {
              setPickupLocation(event.target.value);
              setError(null);
            }}
            className={fieldClass}
          >
            <option value="">{c.anyLocation}</option>
            {carPickupLocations.map((location) => (
              <option key={location.id} value={location.name}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cars-pickup-date" className={labelClass}>
            {s.pickUp}
          </label>
          <input
            id="cars-pickup-date"
            type="date"
            name="pickupDate"
            value={pickupDate}
            min={today}
            onChange={(event) => {
              const value = event.target.value;
              setPickupDate(value);
              if (returnDate && value && returnDate <= value) {
                setReturnDate('');
              }
              setError(null);
            }}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="cars-return-date" className={labelClass}>
            {s.dropOff}
          </label>
          <input
            id="cars-return-date"
            type="date"
            name="returnDate"
            value={returnDate}
            min={returnMinDate}
            onChange={(event) => {
              setReturnDate(event.target.value);
              setError(null);
            }}
            className={fieldClass}
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="min-h-[44px] w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
          >
            {s.search}
          </button>
        </div>
      </div>

      {carPickupError && (
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-300" role="status">
          {c.loadError}
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
