'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type {
  Airline,
  Airport,
  CreateFlightRequest,
  Flight,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useState } from 'react';
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
};

export function FlightForm({
  mode,
  flightId,
  initialFlight,
  airlines: airlinesProp,
  airports: airportsProp,
}: FlightFormProps) {
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.flights.form');
  const tActions = useTranslations('common.actions');
  const tCommon = useTranslations('modules.common');
  const router = useRouter();
  const airlineId = useId();
  const depId = useId();
  const arrId = useId();
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
      getApiClient().listAirlines({ page: 1, limit: 100 }),
      getApiClient().listAirports({ page: 1, limit: 100 }),
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

  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary';

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {formError ? (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      ) : null}

      <div>
        <label htmlFor={airlineId} className="mb-2 block text-sm font-medium text-atg-fg">
          {t('airline')}
        </label>
        <select
          id={airlineId}
          className={selectClass}
          value={values.airlineId}
          onChange={(e) => updateField('airlineId', e.target.value)}
        >
          <option value="">{tCommon('select.chooseDash')}</option>
          {airlines.map((a) => (
            <option key={a.id} value={a.id}>
              {a.iataCode} — {a.name}
            </option>
          ))}
        </select>
        {fieldErrors.airlineId ? (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.airlineId}</p>
        ) : null}
      </div>

      <Input
        label={t('flightNumber')}
        value={values.flightNumber}
        onChange={(e) => updateField('flightNumber', e.target.value.toUpperCase())}
        hint={t('flightNumberHint')}
        error={fieldErrors.flightNumber}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={depId} className="mb-2 block text-sm font-medium text-atg-fg">
            {t('departure')}
          </label>
          <select
            id={depId}
            className={selectClass}
            value={values.departureAirportId}
            onChange={(e) => updateField('departureAirportId', e.target.value)}
          >
            <option value="">{tCommon('select.chooseDash')}</option>
            {airports.map((a) => (
              <option key={a.id} value={a.id}>
                {a.iataCode} — {a.city}
              </option>
            ))}
          </select>
          {fieldErrors.departureAirportId ? (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.departureAirportId}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor={arrId} className="mb-2 block text-sm font-medium text-atg-fg">
            {t('arrival')}
          </label>
          <select
            id={arrId}
            className={selectClass}
            value={values.arrivalAirportId}
            onChange={(e) => updateField('arrivalAirportId', e.target.value)}
          >
            <option value="">{tCommon('select.chooseDash')}</option>
            {airports.map((a) => (
              <option key={a.id} value={a.id}>
                {a.iataCode} — {a.city}
              </option>
            ))}
          </select>
          {fieldErrors.arrivalAirportId ? (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.arrivalAirportId}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-atg-fg">{t('departureTime')}</label>
          <input
            type="datetime-local"
            className={selectClass}
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
            className={selectClass}
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

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          {mode === 'create' ? t('submitCreate') : tActions('save')}
        </Button>
        <Button type="button" variant="outline" href="/produits/vols">
          {tActions('cancel')}
        </Button>
      </div>
    </form>
  );
}
