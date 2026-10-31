'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { CarsSearchParams } from '../../lib/cars/listings';
import { useVehiclePickupLocations } from '../../lib/cars/use-vehicle-pickup-locations';
import { todayISODate } from '../../lib/hotels/dates';
import { useTranslations } from 'next-intl';
import { buildSearchRoute } from '../../lib/search/route';
import {
  SearchFormDatalistInput,
  SearchFormInput,
  SearchFormLabel,
  SearchFormPanel,
  SearchFormSubmit,
} from '../shared';

type CarsSearchFormProps = {
  initialValues: CarsSearchParams;
};

export function CarsSearchForm({ initialValues }: CarsSearchFormProps) {
  const router = useRouter();
  const t = useTranslations('search');
  const c = useTranslations('cars');

  const [departureLocation, setDepartureLocation] = useState(
    initialValues.departureLocation ?? '',
  );
  const [arrivalLocation, setArrivalLocation] = useState(
    initialValues.arrivalLocation ?? '',
  );
  const [travelDate, setTravelDate] = useState(initialValues.travelDate ?? '');
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

  useEffect(() => {
    setDepartureLocation(initialValues.departureLocation ?? '');
    setArrivalLocation(initialValues.arrivalLocation ?? '');
    setTravelDate(initialValues.travelDate ?? '');
    setError(null);
  }, [
    initialValues.departureLocation,
    initialValues.arrivalLocation,
    initialValues.travelDate,
  ]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!departureLocation.trim() || !arrivalLocation.trim() || !travelDate) {
      setError(t('carsRequired'));
      return;
    }

    if (departureLocation.trim() === arrivalLocation.trim()) {
      setError(t('carsSameEndpoints'));
      return;
    }

    const params = new URLSearchParams();
    params.set('departureLocation', departureLocation.trim());
    params.set('arrivalLocation', arrivalLocation.trim());
    params.set('travelDate', travelDate);

    router.push(buildSearchRoute('cars', params));
  }

  return (
    <SearchFormPanel id="cars-search" onSubmit={handleSubmit}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-atg-muted">{t('carsDurationHint')}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
        <div>
          <SearchFormLabel>{c('departureLocation')}</SearchFormLabel>
          <SearchFormDatalistInput
            name="departureLocation"
            placeholder={carPickupLoading ? c('loading') : c('anyLocation')}
            suggestions={carPickupOptions}
            value={departureLocation}
            disabled={carPickupLoading}
            onChange={(value) => {
              setDepartureLocation(value);
              setError(null);
            }}
          />
        </div>

        <div>
          <SearchFormLabel>{c('arrivalLocation')}</SearchFormLabel>
          <SearchFormDatalistInput
            name="arrivalLocation"
            placeholder={carPickupLoading ? c('loading') : c('anyLocation')}
            suggestions={carPickupOptions}
            value={arrivalLocation}
            disabled={carPickupLoading}
            onChange={(value) => {
              setArrivalLocation(value);
              setError(null);
            }}
          />
        </div>

        <div>
          <SearchFormLabel>{c('travelDate')}</SearchFormLabel>
          <SearchFormInput
            type="date"
            name="travelDate"
            value={travelDate}
            min={today}
            onChange={(value) => {
              setTravelDate(value);
              setError(null);
            }}
          />
        </div>

        <div className="flex items-end">
          <SearchFormSubmit label={t('search')} />
        </div>
      </div>

      {carPickupError && (
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-300" role="status">
          {c('loadError')}
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
