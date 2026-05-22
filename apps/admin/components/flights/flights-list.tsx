'use client';

import {
  Button,
  Card,
  DataTable,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Airline, Airport, Flight } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getVolsErrorMessage } from '../../lib/vols-errors';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function formatSchedule(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function FlightsList() {
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
  }, [page, search]);

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
      if (!window.confirm(`Supprimer le vol « ${flight.flightNumber} » ?`)) return;
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
    [load],
  );

  const columns = useMemo<ColumnDef<Flight, unknown>[]>(
    () => [
      {
        accessorKey: 'flightNumber',
        header: 'Code vol',
        cell: ({ row }) => (
          <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-sm font-semibold text-atg-fg ring-1 ring-atg-border/60">
            {row.original.flightNumber}
          </code>
        ),
      },
      {
        id: 'airline',
        header: 'Compagnie',
        cell: ({ row }) => airlineById.get(row.original.airlineId)?.name ?? '—',
      },
      {
        id: 'route',
        header: 'Trajet',
        cell: ({ row }) => {
          const dep = airportById.get(row.original.departureAirportId);
          const arr = airportById.get(row.original.arrivalAirportId);
          return (
            <span className="text-sm">
              {dep?.iataCode ?? '?'} → {arr?.iataCode ?? '?'}
            </span>
          );
        },
      },
      {
        id: 'departure',
        header: 'Départ',
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-atg-muted">
            {formatSchedule(row.original.departureTime)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1.5">
            <Button href={`/produits/vols/${row.original.id}`} variant="ghost" size="sm">
              Modifier
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
              className="!text-red-600"
            >
              Supprimer
            </Button>
          </div>
        ),
      },
    ],
    [airlineById, airportById, deletingId, handleDelete],
  );

  const flights = state.status === 'ready' ? state.flights : [];
  const emptyMessage =
    search.trim().length > 0
      ? 'Aucun vol ne correspond à ce code.'
      : 'Aucun vol pour le moment.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <Input
            type="search"
            placeholder="Rechercher par code vol (ex. ET302)…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Rechercher un vol"
          />
        </div>
        <Button href="/produits/vols/nouveau">Nouveau vol</Button>
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
              itemLabel="vol"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
