'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Input, SearchableSelect } from '@africatourismgate/ui';
import type {
  Airline,
  Airport,
  CreateFlightRequest,
  Flight,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '../../lib/flight-datetime';

export type FlightFormValues = {
  airlineId: string;
  flightNumber: string;
  departureAirportId: string;
  arrivalAirportId: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: string;
};

const defaultValues: FlightFormValues = {
  airlineId: '',
  flightNumber: '',
  departureAirportId: '',
  arrivalAirportId: '',
  departureTime: '',
  arrivalTime: '',
  durationMinutes: '',
};

function flightToFormValues(flight: Flight): FlightFormValues {
  return {
    airlineId: flight.airlineId,
    flightNumber: flight.flightNumber,
    departureAirportId: flight.departureAirportId,
    arrivalAirportId: flight.arrivalAirportId,
    departureTime: toDatetimeLocalValue(flight.departureTime),
    arrivalTime: toDatetimeLocalValue(flight.arrivalTime),
    durationMinutes: String(flight.durationMinutes),
  };
}

function toPayload(values: FlightFormValues): CreateFlightRequest {
  return {
    airlineId: values.airlineId,
    flightNumber: values.flightNumber.trim().toUpperCase(),
    departureAirportId: values.departureAirportId,
    arrivalAirportId: values.arrivalAirportId,
    departureTime: fromDatetimeLocalValue(values.departureTime),
    arrivalTime: fromDatetimeLocalValue(values.arrivalTime),
    durationMinutes: Number(values.durationMinutes),
  };
}

type FlightFormProps = {
  mode: 'create' | 'edit';
  flightId?: string;
  initialFlight?: Flight;
  airlines?: Airline[];
  airports?: Airport[];
  /** Affiché à droite du formulaire (ex. photos en édition). */
  identityAside?: ReactNode;
};

export function FlightForm({
  mode,
  flightId,
  initialFlight,
  airlines: airlinesProp,
  airports: airportsProp,
  identityAside,
}: FlightFormProps) {
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.flights.form');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const tCommon = useTranslations('modules.common');
  const tSelect = useTranslations('modules.common.select');
  const router = useRouter();
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [values, setValues] = useState<FlightFormValues>(() =>
    initialFlight ? flightToFormValues(initialFlight) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FlightFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (airlinesProp && airportsProp) {
      setAirlines(airlinesProp);
      setAirports(airportsProp);
      return;
    }
    void Promise.all([
      getApiClient().listAirlines({ page: 1, limit: 200 }),
      getApiClient().listAirports({ page: 1, limit: 500 }),
    ])
      .then(([a, p]) => {
        setAirlines(a.data);
        setAirports(p.data);
      })
      .catch(() => {
        setAirlines([]);
        setAirports([]);
      });
  }, [airlinesProp, airportsProp]);

  const updateField = useCallback(
    <K extends keyof FlightFormValues>(key: K, value: FlightFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof FlightFormValues, string>> = {};
    if (!values.airlineId) errors.airlineId = t('validation.airlineRequired');
    if (!values.flightNumber.trim()) errors.flightNumber = t('validation.flightNumberRequired');
    if (!values.departureAirportId) {
      errors.departureAirportId = t('validation.departureAirportRequired');
    }
    if (!values.arrivalAirportId) errors.arrivalAirportId = t('validation.arrivalAirportRequired');
    if (values.departureAirportId === values.arrivalAirportId) {
      errors.arrivalAirportId = t('validation.airportsMustDiffer');
    }
    if (!values.departureTime) errors.departureTime = t('validation.departureTimeRequired');
    if (!values.arrivalTime) errors.arrivalTime = t('validation.arrivalTimeRequired');
    const duration = Number(values.durationMinutes);
    if (!Number.isFinite(duration) || duration < 1) {
      errors.durationMinutes = tCommon('validation.invalidDurationMinutes');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      const payload = toPayload(values);
      if (mode === 'create') {
        const created = await client.createFlight(payload);
        router.push(`/produits/vols/${created.id}`);
        router.refresh();
      } else if (flightId) {
        await client.updateFlight(flightId, payload);
        router.push('/produits/vols');
        router.refresh();
      }
    } catch (error) {
      setFormError(getVolsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const airlineOptions = useMemo(
    () =>
      airlines.map((airline) => ({
        value: airline.id,
        label: `${airline.iataCode} — ${airline.name}`,
      })),
    [airlines],
  );

  const airportOptions = useMemo(
    () =>
      airports.map((airport) => ({
        value: airport.id,
        label: `${airport.iataCode} — ${airport.city}${
          airport.name?.trim() && airport.name.trim() !== airport.city
            ? ` (${airport.name.trim()})`
            : ''
        }`,
      })),
    [airports],
  );

  const fieldInputClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary';

  const fields = (
    <div className="space-y-4">
      <SearchableSelect
        label={t('airline')}
        name="airlineId"
        value={values.airlineId}
        options={airlineOptions}
        onChange={(next) => updateField('airlineId', next)}
        searchPlaceholder={tSelect('searchPlaceholder')}
        emptyMessage={tSelect('empty')}
        placeholder={tCommon('select.chooseDash')}
        error={fieldErrors.airlineId}
        required
      />

      <Input
        label={t('flightNumber')}
        value={values.flightNumber}
        onChange={(e) => updateField('flightNumber', e.target.value.toUpperCase())}
        hint={t('flightNumberHint')}
        error={fieldErrors.flightNumber}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SearchableSelect
          label={t('departure')}
          name="departureAirportId"
          value={values.departureAirportId}
          options={airportOptions}
          onChange={(next) => updateField('departureAirportId', next)}
          searchPlaceholder={tSelect('searchPlaceholder')}
          emptyMessage={tSelect('empty')}
          placeholder={tCommon('select.chooseDash')}
          error={fieldErrors.departureAirportId}
          required
        />
        <SearchableSelect
          label={t('arrival')}
          name="arrivalAirportId"
          value={values.arrivalAirportId}
          options={airportOptions}
          onChange={(next) => updateField('arrivalAirportId', next)}
          searchPlaceholder={tSelect('searchPlaceholder')}
          emptyMessage={tSelect('empty')}
          placeholder={tCommon('select.chooseDash')}
          error={fieldErrors.arrivalAirportId}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-atg-fg">{t('departureTime')}</label>
          <input
            type="datetime-local"
            className={fieldInputClass}
            value={values.departureTime}
            onChange={(e) => updateField('departureTime', e.target.value)}
          />
          {fieldErrors.departureTime ? (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.departureTime}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-atg-fg">{t('arrivalTime')}</label>
          <input
            type="datetime-local"
            className={fieldInputClass}
            value={values.arrivalTime}
            onChange={(e) => updateField('arrivalTime', e.target.value)}
          />
          {fieldErrors.arrivalTime ? (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.arrivalTime}</p>
          ) : null}
        </div>
      </div>

      <Input
        label={t('durationMinutes')}
        type="number"
        min={1}
        value={values.durationMinutes}
        onChange={(e) => updateField('durationMinutes', e.target.value)}
        hint={t('durationHint')}
        error={fieldErrors.durationMinutes}
      />
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={identityAside ? 'w-full space-y-4' : 'mx-auto max-w-2xl space-y-6'}
    >
      {formError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      ) : null}

      {identityAside ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <Card variant="dashboard" padding="sm">
            {fields}
          </Card>
          <div className="min-w-0">{identityAside}</div>
        </div>
      ) : (
        fields
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
          {mode === 'create' ? t('submitCreate') : tActions('save')}
        </Button>
        <Button type="button" variant="outline" href="/produits/vols" disabled={submitting}>
          {tActions('cancel')}
        </Button>
      </div>
    </form>
  );
}
