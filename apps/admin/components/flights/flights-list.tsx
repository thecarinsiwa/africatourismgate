'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Airline, Airport, Flight } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { FlightThumbnail } from './flight-thumbnail';
import { FlightTimeline } from './flight-timeline';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function FlightsList() {
  const locale = useLocale();
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.flights.list');
  const tColumns = useTranslations('modules.flights.columns');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tPagination = useTranslations('modules.common.pagination');
  const tCommon = useTranslations('modules.common');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; flights: Flight[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const emptyDash = tCommon('empty.dash');

  const formatSchedule = useCallback(
    (iso: string): string => {
      try {
        return new Date(iso).toLocaleString(locale, {
          dateStyle: 'short',
          timeStyle: 'short',
        });
      } catch {
        return iso;
      }
    },
    [locale],
  );

  useEffect(() => {
    const client = getApiClient();
    void Promise.all([
      client.listAirlines({ page: 1, limit: 100 }),
      client.listAirports({ page: 1, limit: 100 }),
    ])
      .then(([a, p]) => {
        setAirlines(a.data);
        setAirports(p.data);
      })
      .catch(() => {
        setAirlines([]);
        setAirports([]);
      });
  }, []);

  const airlineById = useMemo(
    () => new Map(airlines.map((a) => [a.id, a])),
    [airlines],
  );
  const airportById = useMemo(
    () => new Map(airports.map((a) => [a.id, a])),
    [airports],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listFlights({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        flights: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getVolsErrorMessage(error) });
    }
  }, [page, search, getVolsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== query) setPage(1);
        return query;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = useCallback(
    async (flight: Flight) => {
      if (!window.confirm(t('deleteConfirm', { flightNumber: flight.flightNumber }))) return;
      setDeleteError(null);
      setDeletingId(flight.id);
      try {
        await getApiClient().deleteFlight(flight.id);
        await load();
      } catch (error) {
        setDeleteError(getVolsErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load, t, getVolsErrorMessage],
  );

  const columns = useMemo<ColumnDef<Flight, unknown>[]>(
    () => [
      {
        id: 'thumbnail',
        header: '',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <FlightThumbnail
            flightId={row.original.id}
            label={row.original.flightNumber}
            size="md"
          />
        ),
      },
      {
        accessorKey: 'flightNumber',
        header: tColumns('flightNumber'),
        cell: ({ row }) => (
          <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-sm font-semibold text-atg-fg ring-1 ring-atg-border/60">
            {row.original.flightNumber}
          </code>
        ),
      },
      {
        id: 'airline',
        header: tColumns('airline'),
        cell: ({ row }) => airlineById.get(row.original.airlineId)?.name ?? emptyDash,
      },
      {
        id: 'route',
        header: tColumns('route'),
        cell: ({ row }) => {
          const dep = airportById.get(row.original.departureAirportId) ?? null;
          const arr = airportById.get(row.original.arrivalAirportId) ?? null;
          return (
            <FlightTimeline
              compact
              departureAirport={dep}
              arrivalAirport={arr}
              departureTime={row.original.departureTime}
              arrivalTime={row.original.arrivalTime}
              durationMinutes={row.original.durationMinutes}
              className="min-w-[12rem]"
            />
          );
        },
      },
      {
        id: 'departure',
        header: tColumns('departure'),
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-atg-muted">
            {formatSchedule(row.original.departureTime)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: tCommonColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton action="edit" href={`/produits/vols/${row.original.id}`} />
            <DataTableActionButton
              action="delete"
              onClick={() => void handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [
      airlineById,
      airportById,
      deletingId,
      emptyDash,
      formatSchedule,
      handleDelete,
      tColumns,
      tCommonColumns,
    ],
  );

  const flights = state.status === 'ready' ? state.flights : [];
  const emptyMessage =
    search.trim().length > 0 ? t('emptySearch') : t('emptyDefault');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label={t('searchAria')}
          />
        </div>
        <Button href="/produits/vols/nouveau">{t('newFlight')}</Button>
      </div>

      {deleteError ? (
        <p role="alert" className="text-sm text-red-600">
          {deleteError}
        </p>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none">
            <DataTable
              columns={columns}
              data={flights}
              isLoading={state.status === 'loading'}
              emptyMessage={emptyMessage}
              emptyVariant={search.trim().length > 0 ? 'search' : 'default'}
              getRowId={(r) => r.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('flight')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
