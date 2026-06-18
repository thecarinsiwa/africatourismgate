'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toFlightAirportOptions } from '../../lib/flights/airports';
import type { FlightsSearchParams } from '../../lib/flights/listings';
import { usePublicAirports } from '../../lib/flights/use-public-airports';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { buildSearchRoute } from '../../lib/search/route';
import {
  SearchFormInput,
  SearchFormLabel,
  SearchFormOptionSelect,
  SearchFormPanel,
  SearchFormSubmit,
} from '../shared';

type FlightTripType = 'oneWay' | 'roundTrip';

type FlightsSearchFormProps = {
  initialValues: FlightsSearchParams;
};

function FlightTripTypeToggle({
  value,
  oneWayLabel,
  roundTripLabel,
  ariaLabel,
  onChange,
}: {
  value: FlightTripType;
  oneWayLabel: string;
  roundTripLabel: string;
  ariaLabel: string;
  onChange: (tripType: FlightTripType) => void;
}) {
  const options: { id: FlightTripType; label: string }[] = [
    { id: 'oneWay', label: oneWayLabel },
    { id: 'roundTrip', label: roundTripLabel },
  ];

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded-lg border border-atg-border bg-atg-surface p-1 dark:border-atg-border dark:bg-atg-surface"
    >
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              selected
                ? 'bg-primary text-white shadow-sm'
                : 'text-atg-muted hover:text-atg-fg dark:hover:text-white'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function FlightsSearchForm({ initialValues }: FlightsSearchFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const f = t.flights;
  const s = t.search;

  const { airports, loading: airportsLoading, error: airportsError } = usePublicAirports();
  const airportOptions = useMemo(() => toFlightAirportOptions(airports), [airports]);

  const [flightFrom, setFlightFrom] = useState(initialValues.from ?? '');
  const [flightTo, setFlightTo] = useState(initialValues.to ?? '');
  const [departDate, setDepartDate] = useState(initialValues.departureDate ?? '');
  const [returnDate, setReturnDate] = useState(initialValues.returnDate ?? '');
  const [passengers, setPassengers] = useState(initialValues.passengers ?? '1');
  const [tripType, setTripType] = useState<FlightTripType>(
    initialValues.returnDate ? 'roundTrip' : 'oneWay',
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFlightFrom(initialValues.from ?? '');
    setFlightTo(initialValues.to ?? '');
    setDepartDate(initialValues.departureDate ?? '');
    setReturnDate(initialValues.returnDate ?? '');
    setPassengers(initialValues.passengers ?? '1');
    setTripType(initialValues.returnDate ? 'roundTrip' : 'oneWay');
    setError(null);
  }, [
    initialValues.from,
    initialValues.to,
    initialValues.departureDate,
    initialValues.returnDate,
    initialValues.passengers,
  ]);

  function handleTripTypeChange(next: FlightTripType) {
    setTripType(next);
    if (next === 'oneWay') {
      setReturnDate('');
    }
    setError(null);
  }

  function swapAirports() {
    setFlightFrom(flightTo);
    setFlightTo(flightFrom);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!flightFrom || !flightTo || !departDate) {
      setError(s.flightRequired);
      return;
    }

    if (flightFrom === flightTo) {
      setError(s.flightSameAirport);
      return;
    }

    if (tripType === 'roundTrip' && !returnDate) {
      setError(s.flightReturnRequired);
      return;
    }

    if (returnDate && returnDate <= departDate) {
      setError(s.flightReturnAfterDeparture);
      return;
    }

    const params = new URLSearchParams({
      from: flightFrom,
      to: flightTo,
      departureDate: departDate,
      passengers: String(Math.max(1, Number.parseInt(passengers, 10) || 1)),
    });
    if (tripType === 'roundTrip' && returnDate) {
      params.set('returnDate', returnDate);
    }

    router.push(buildSearchRoute('flights', params));
  }

  const gridClass =
    tripType === 'roundTrip'
      ? 'lg:grid-cols-[1fr_1fr_auto_1fr_1fr_0.75fr_auto]'
      : 'lg:grid-cols-[1fr_1fr_auto_1fr_0.75fr_auto]';

  return (
    <SearchFormPanel id="flights-search" onSubmit={handleSubmit}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FlightTripTypeToggle
          value={tripType}
          oneWayLabel={s.oneWay}
          roundTripLabel={s.roundTrip}
          ariaLabel={s.tripTypeAria}
          onChange={handleTripTypeChange}
        />
      </div>

      <div className={`grid gap-4 sm:grid-cols-2 ${gridClass} lg:items-end`}>
        <div>
          <SearchFormLabel>{s.from}</SearchFormLabel>
          <SearchFormOptionSelect
            name="from"
            placeholder={airportsLoading ? f.loading : s.airportPh}
            options={airportOptions.map((airport) => ({
              value: airport.iataCode,
              label: airport.label,
            }))}
            value={flightFrom}
            disabled={airportsLoading || airportOptions.length === 0}
            onChange={(value) => {
              setFlightFrom(value);
              setError(null);
            }}
          />
        </div>

        <div>
          <SearchFormLabel>{s.to}</SearchFormLabel>
          <SearchFormOptionSelect
            name="to"
            placeholder={airportsLoading ? f.loading : s.airportPh}
            options={airportOptions.map((airport) => ({
              value: airport.iataCode,
              label: airport.label,
            }))}
            value={flightTo}
            disabled={airportsLoading || airportOptions.length === 0}
            onChange={(value) => {
              setFlightTo(value);
              setError(null);
            }}
          />
        </div>

        <div className="flex items-end pb-0.5 lg:justify-center">
          <button
            type="button"
            onClick={swapAirports}
            aria-label={s.swapAirports}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-atg-border text-atg-muted transition-colors hover:border-primary hover:text-primary dark:border-atg-border dark:hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        <div>
          <SearchFormLabel>{s.departDate}</SearchFormLabel>
          <SearchFormInput
            type="date"
            name="departureDate"
            value={departDate}
            onChange={(value) => {
              setDepartDate(value);
              setError(null);
            }}
          />
        </div>

        {tripType === 'roundTrip' ? (
          <div>
            <SearchFormLabel>{s.returnDate}</SearchFormLabel>
            <SearchFormInput
              type="date"
              name="returnDate"
              value={returnDate}
              min={departDate || undefined}
              onChange={(value) => {
                setReturnDate(value);
                setError(null);
              }}
            />
          </div>
        ) : null}

        <div>
          <SearchFormLabel>{s.passengers}</SearchFormLabel>
          <SearchFormInput
            type="number"
            name="passengers"
            placeholder="1"
            value={passengers}
            min="1"
            onChange={setPassengers}
          />
        </div>

        <div className="flex items-end">
          <SearchFormSubmit label={s.search} />
        </div>
      </div>

      {airportsError ? (
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-300" role="status">
          {f.loadError}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </SearchFormPanel>
  );
}
