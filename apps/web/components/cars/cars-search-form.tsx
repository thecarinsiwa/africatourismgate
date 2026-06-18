'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { countRentalDays, type CarsSearchParams } from '../../lib/cars/listings';
import { useVehiclePickupLocations } from '../../lib/cars/use-vehicle-pickup-locations';
import { addDays, todayISODate } from '../../lib/hotels/dates';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { buildSearchRoute } from '../../lib/search/route';
import {
  SearchFormInput,
  SearchFormLabel,
  SearchFormPanel,
  SearchFormSelect,
  SearchFormSubmit,
} from '../shared';

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

  const carPickupOptions = useMemo(
    () => carPickupLocations.map((location) => location.name),
    [carPickupLocations],
  );

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

    const params = new URLSearchParams();
    if (pickupLocation.trim()) params.set('pickupLocation', pickupLocation.trim());
    if (pickupDate) params.set('pickupDate', pickupDate);
    if (returnDate) params.set('returnDate', returnDate);

    router.push(buildSearchRoute('cars', params));
  }

  return (
    <SearchFormPanel id="cars-search" onSubmit={handleSubmit}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {rentalDaysLabel ? (
          <span
            className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border bg-atg-surface px-4 py-2 text-sm font-semibold text-atg-fg dark:border-atg-border dark:bg-atg-surface dark:text-white"
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
          <SearchFormLabel>{c.pickupLocation}</SearchFormLabel>
          <SearchFormSelect
            name="pickupLocation"
            placeholder={carPickupLoading ? c.loading : c.anyLocation}
            options={carPickupOptions}
            value={pickupLocation}
            disabled={carPickupLoading || carPickupOptions.length === 0}
            onChange={(value) => {
              setPickupLocation(value);
              setError(null);
            }}
          />
        </div>

        <div>
          <SearchFormLabel>{s.pickUp}</SearchFormLabel>
          <SearchFormInput
            type="date"
            name="pickupDate"
            value={pickupDate}
            min={today}
            onChange={(value) => {
              setPickupDate(value);
              if (returnDate && value && returnDate <= value) {
                setReturnDate('');
              }
              setError(null);
            }}
          />
        </div>

        <div>
          <SearchFormLabel>{s.dropOff}</SearchFormLabel>
          <SearchFormInput
            type="date"
            name="returnDate"
            value={returnDate}
            min={returnMinDate}
            onChange={(value) => {
              setReturnDate(value);
              setError(null);
            }}
          />
        </div>

        <div className="flex items-end">
          <SearchFormSubmit label={s.search} />
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
    </SearchFormPanel>
  );
}
