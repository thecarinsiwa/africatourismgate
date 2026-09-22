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
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  durationMinutesFromDatetimeLocal,
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

/** API PaginationQueryDto caps `limit` at 100. */
const OPTIONS_LIMIT = 100;
const SEARCH_DEBOUNCE_MS = 300;

const defaultValues: FlightFormValues = {
  airlineId: '',
  flightNumber: '',
  departureAirportId: '',
  arrivalAirportId: '',
  departureTime: '',
  arrivalTime: '',
  durationMinutes: '',
};

function upsertById<T extends { id: string }>(items: T[], extra: T | null | undefined): T[] {
  if (!extra) return items;
  if (items.some((item) => item.id === extra.id)) return items;
  return [extra, ...items];
}

function keepSelectedById<T extends { id: string }>(
  items: T[],
  selectedIds: Array<string | undefined>,
  pool: T[],
): T[] {
  let next = items;
  for (const id of selectedIds) {
    if (!id || next.some((item) => item.id === id)) continue;
    const found = pool.find((item) => item.id === id);
    if (found) next = [found, ...next];
  }
  return next;
}

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
  const airlinePoolRef = useRef<Airline[]>([]);
  const airportPoolRef = useRef<Airport[]>([]);
  const valuesRef = useRef(values);
  const airlineSearchSkipRef = useRef(true);
  const airportSearchSkipRef = useRef(true);
  const [optionsLoading, setOptionsLoading] = useState(
    !(airlinesProp && airportsProp),
  );
  const [airlinesSearching, setAirlinesSearching] = useState(false);
  const [airportsSearching, setAirportsSearching] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [airlineSearch, setAirlineSearch] = useState('');
  const [airportSearch, setAirportSearch] = useState('');
  const remoteOptions = !(airlinesProp && airportsProp);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FlightFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  valuesRef.current = values;

  useEffect(() => {
    airlinePoolRef.current = airlines;
  }, [airlines]);

  useEffect(() => {
    airportPoolRef.current = airports;
  }, [airports]);

  useEffect(() => {
    if (airlinesProp && airportsProp) {
      setAirlines(airlinesProp);
      setAirports(airportsProp);
      setOptionsLoading(false);
      setOptionsError(null);
      return;
    }

    let cancelled = false;
    setOptionsLoading(true);
    setOptionsError(null);

    void (async () => {
      try {
        const client = getApiClient();
        const [airlinesResult, airportsResult] = await Promise.all([
          client.listAirlines({ page: 1, limit: OPTIONS_LIMIT }),
          client.listAirports({ page: 1, limit: OPTIONS_LIMIT }),
        ]);
        if (cancelled) return;

        let nextAirlines = airlinesResult.data;
        let nextAirports = airportsResult.data;

        if (initialFlight) {
          const missing: Promise<void>[] = [];
          if (
            initialFlight.airlineId &&
            !nextAirlines.some((item) => item.id === initialFlight.airlineId)
          ) {
            missing.push(
              client
                .getAirline(initialFlight.airlineId)
                .then((airline) => {
                  nextAirlines = upsertById(nextAirlines, airline);
                })
                .catch(() => undefined),
            );
          }
          for (const airportId of [
            initialFlight.departureAirportId,
            initialFlight.arrivalAirportId,
          ]) {
            if (!airportId || nextAirports.some((item) => item.id === airportId)) {
              continue;
            }
            missing.push(
              client
                .getAirport(airportId)
                .then((airport) => {
                  nextAirports = upsertById(nextAirports, airport);
                })
                .catch(() => undefined),
            );
          }
          if (missing.length > 0) await Promise.all(missing);
        }

        if (cancelled) return;
        setAirlines(nextAirlines);
        setAirports(nextAirports);
      } catch {
        if (!cancelled) {
          setAirlines([]);
          setAirports([]);
          setOptionsError(tSelect('loadError'));
        }
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [airlinesProp, airportsProp, initialFlight, tSelect]);

  useEffect(() => {
    if (!remoteOptions) return;
    if (airlineSearchSkipRef.current) {
      airlineSearchSkipRef.current = false;
      return;
    }

    const query = airlineSearch.trim();
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setAirlinesSearching(true);
      void getApiClient()
        .listAirlines({
          page: 1,
          limit: OPTIONS_LIMIT,
          search: query || undefined,
        })
        .then((result) => {
          if (cancelled) return;
          setAirlines(
            keepSelectedById(
              result.data,
              [valuesRef.current.airlineId],
              airlinePoolRef.current,
            ),
          );
        })
        .catch(() => {
          if (!cancelled) setOptionsError(tSelect('loadError'));
        })
        .finally(() => {
          if (!cancelled) setAirlinesSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [airlineSearch, remoteOptions, tSelect]);

  useEffect(() => {
    if (!remoteOptions) return;
    if (airportSearchSkipRef.current) {
      airportSearchSkipRef.current = false;
      return;
    }

    const query = airportSearch.trim();
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setAirportsSearching(true);
      void getApiClient()
        .listAirports({
          page: 1,
          limit: OPTIONS_LIMIT,
          search: query || undefined,
        })
        .then((result) => {
          if (cancelled) return;
          setAirports(
            keepSelectedById(
              result.data,
              [
                valuesRef.current.departureAirportId,
                valuesRef.current.arrivalAirportId,
              ],
              airportPoolRef.current,
            ),
          );
        })
        .catch(() => {
          if (!cancelled) setOptionsError(tSelect('loadError'));
        })
        .finally(() => {
          if (!cancelled) setAirportsSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [airportSearch, remoteOptions, tSelect]);

  const updateField = useCallback(
    <K extends keyof FlightFormValues>(key: K, value: FlightFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const updateScheduleTime = useCallback(
    (key: 'departureTime' | 'arrivalTime', value: string) => {
      setValues((prev) => {
        const next = { ...prev, [key]: value };
        const duration = durationMinutesFromDatetimeLocal(
          next.departureTime,
          next.arrivalTime,
        );
        next.durationMinutes = duration != null ? String(duration) : '';
        return next;
      });
      setFieldErrors((prev) => ({
        ...prev,
        departureTime: undefined,
        arrivalTime: undefined,
        durationMinutes: undefined,
      }));
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
    if (values.departureTime && values.arrivalTime) {
      const departureMs = new Date(values.departureTime).getTime();
      const arrivalMs = new Date(values.arrivalTime).getTime();
      if (
        Number.isFinite(departureMs) &&
        Number.isFinite(arrivalMs) &&
        departureMs >= arrivalMs
      ) {
        errors.departureTime = t('validation.departureBeforeArrival');
      }
    }
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

  const toAirportOption = useCallback(
    (airport: Airport) => ({
      value: airport.id,
      label: `${airport.iataCode} — ${airport.city}${
        airport.name?.trim() && airport.name.trim() !== airport.city
          ? ` (${airport.name.trim()})`
          : ''
      }`,
    }),
    [],
  );

  const departureAirportOptions = useMemo(
    () =>
      airports
        .filter((airport) => {
          if (airport.id === values.departureAirportId) return true;
          return airport.id !== values.arrivalAirportId;
        })
        .map(toAirportOption),
    [airports, values.arrivalAirportId, values.departureAirportId, toAirportOption],
  );

  const arrivalAirportOptions = useMemo(
    () =>
      airports
        .filter((airport) => {
          if (airport.id === values.arrivalAirportId) return true;
          return airport.id !== values.departureAirportId;
        })
        .map(toAirportOption),
    [airports, values.departureAirportId, values.arrivalAirportId, toAirportOption],
  );

  const fieldInputClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary';

  const fields = (
    <div className="space-y-4">
      {optionsError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {optionsError}
        </p>
      ) : null}

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
        filterLocally={!remoteOptions}
        onSearchChange={remoteOptions ? setAirlineSearch : undefined}
        loading={optionsLoading || airlinesSearching}
        loadingMessage={tSelect('loading')}
        disabled={optionsLoading && airlineOptions.length === 0}
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
          options={departureAirportOptions}
          onChange={(next) => updateField('departureAirportId', next)}
          searchPlaceholder={tSelect('searchPlaceholder')}
          emptyMessage={tSelect('empty')}
          placeholder={tCommon('select.chooseDash')}
          error={fieldErrors.departureAirportId}
          required
          filterLocally={!remoteOptions}
          onSearchChange={remoteOptions ? setAirportSearch : undefined}
          loading={optionsLoading || airportsSearching}
          loadingMessage={tSelect('loading')}
          disabled={optionsLoading && departureAirportOptions.length === 0}
        />
        <SearchableSelect
          label={t('arrival')}
          name="arrivalAirportId"
          value={values.arrivalAirportId}
          options={arrivalAirportOptions}
          onChange={(next) => updateField('arrivalAirportId', next)}
          searchPlaceholder={tSelect('searchPlaceholder')}
          emptyMessage={tSelect('empty')}
          placeholder={tCommon('select.chooseDash')}
          error={fieldErrors.arrivalAirportId}
          required
          filterLocally={!remoteOptions}
          onSearchChange={remoteOptions ? setAirportSearch : undefined}
          loading={optionsLoading || airportsSearching}
          loadingMessage={tSelect('loading')}
          disabled={optionsLoading && arrivalAirportOptions.length === 0}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-atg-fg">{t('departureTime')}</label>
          <input
            type="datetime-local"
            className={fieldInputClass}
            value={values.departureTime}
            max={values.arrivalTime || undefined}
            onChange={(e) => updateScheduleTime('departureTime', e.target.value)}
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
            min={values.departureTime || undefined}
            onChange={(e) => updateScheduleTime('arrivalTime', e.target.value)}
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
        readOnly
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
