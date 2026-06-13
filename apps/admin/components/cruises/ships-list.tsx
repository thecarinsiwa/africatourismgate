'use client';

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
import type { CruiseLine, Ship } from '@africatourismgate/types';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getCroisieresErrorMessage } from '../../lib/croisieres-errors';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function ShipsList() {
  const lineFilterId = useId();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [lineFilter, setLineFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lines, setLines] = useState<CruiseLine[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; ships: Ship[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    void getApiClient()
      .listCruiseLines({ page: 1, limit: 100 })
      .then((r) => setLines(r.data))
      .catch(() => setLines([]));
  }, []);

  const lineById = useMemo(() => new Map(lines.map((l) => [l.id, l.name])), [lines]);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listShips({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        cruiseLineId: lineFilter || undefined,
      });
      setState({
        status: 'ready',
        ships: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getCroisieresErrorMessage(error) });
    }
  }, [page, search, lineFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const q = searchInput.trim();
    const t = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== q) setPage(1);
        return q;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const handleDelete = useCallback(
    async (ship: Ship) => {
      if (!window.confirm(`Supprimer le navire « ${ship.name} » ?`)) return;
      setDeleteError(null);
      setDeletingId(ship.id);
      try {
        await getApiClient().deleteShip(ship.id);
        await load();
      } catch (error) {
        setDeleteError(getCroisieresErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<Ship, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Navire' },
      {
        id: 'line',
        header: 'Ligne',
        cell: ({ row }) => lineById.get(row.original.cruiseLineId) ?? '—',
      },
      {
        accessorKey: 'builtYear',
        header: 'Année',
        cell: ({ row }) => row.original.builtYear ?? '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="edit"
              href={`/produits/croisieres/navires/${row.original.id}`}
            />
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
    [deletingId, handleDelete, lineById],
  );

  const ships = state.status === 'ready' ? state.ships : [];
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:max-w-2xl">
          <Input
            type="search"
            placeholder="Rechercher un navire…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select
            id={lineFilterId}
            className={selectClass}
            value={lineFilter}
            onChange={(e) => {
              setLineFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filtrer par ligne"
          >
            <option value="">Toutes les lignes</option>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <Button href="/produits/croisieres/navires/nouveau">Nouveau navire</Button>
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
              data={ships}
              isLoading={state.status === 'loading'}
              emptyMessage="Aucun navire."
              getRowId={(r) => r.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="navire"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
