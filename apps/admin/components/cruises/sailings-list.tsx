'use client';

import {
  Button,
  Card,
  DataTable,
  DataTablePagination,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { CruiseSailing, Itinerary, Ship } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getCroisieresErrorMessage } from '../../lib/croisieres-errors';

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { dateStyle: 'medium' });
  } catch {
    return iso;
  }
}

export function SailingsList() {
  const [page, setPage] = useState(1);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        sailings: CruiseSailing[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const client = getApiClient();
    void Promise.all([
      client.listItineraries({ page: 1, limit: 200 }),
      client.listShips({ page: 1, limit: 200 }),
    ])
      .then(([i, s]) => {
        setItineraries(i.data);
        setShips(s.data);
      })
      .catch(() => {
        setItineraries([]);
        setShips([]);
      });
  }, []);

  const itineraryById = useMemo(
    () => new Map(itineraries.map((i) => [i.id, i])),
    [itineraries],
  );
  const shipById = useMemo(() => new Map(ships.map((s) => [s.id, s])), [ships]);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listCruiseSailings({
        page,
        limit: PAGE_SIZE,
      });
      setState({
        status: 'ready',
        sailings: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getCroisieresErrorMessage(error) });
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = useCallback(
    async (sailing: CruiseSailing) => {
      const itinerary = itineraryById.get(sailing.itineraryId);
      const label = itinerary
        ? `${itinerary.name} — ${formatDate(sailing.departureDate)}`
        : formatDate(sailing.departureDate);
      if (!window.confirm(`Supprimer le départ « ${label} » ?`)) return;
      setDeleteError(null);
      setDeletingId(sailing.id);
      try {
        await getApiClient().deleteCruiseSailing(sailing.id);
        await load();
      } catch (error) {
        setDeleteError(getCroisieresErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [itineraryById, load],
  );

  const columns = useMemo<ColumnDef<CruiseSailing, unknown>[]>(
    () => [
      {
        id: 'departure',
        header: 'Départ',
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-medium">
            {formatDate(row.original.departureDate)}
          </span>
        ),
      },
      {
        id: 'itinerary',
        header: 'Itinéraire',
        cell: ({ row }) => {
          const it = itineraryById.get(row.original.itineraryId);
          return it?.name ?? '—';
        },
      },
      {
        id: 'ship',
        header: 'Navire',
        cell: ({ row }) => {
          const it = itineraryById.get(row.original.itineraryId);
          const ship = it ? shipById.get(it.shipId) : undefined;
          return ship?.name ?? '—';
        },
      },
      {
        id: 'nights',
        header: 'Nuits',
        meta: { align: 'center' },
        cell: ({ row }) => {
          const it = itineraryById.get(row.original.itineraryId);
          return it?.durationNights ?? '—';
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1.5">
            <Button
              href={`/produits/croisieres/${row.original.id}`}
              variant="ghost"
              size="sm"
            >
              Modifier
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="!text-red-600"
              onClick={() => void handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            >
              Supprimer
            </Button>
          </div>
        ),
      },
    ],
    [deletingId, handleDelete, itineraryById, shipById],
  );

  const sailings = state.status === 'ready' ? state.sailings : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button href="/produits/croisieres/nouveau">Nouveau départ</Button>
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
              data={sailings}
              isLoading={state.status === 'loading'}
              emptyMessage="Aucun départ programmé."
              getRowId={(r) => r.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="départ"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
