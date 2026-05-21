'use client';

import {
  Button,
  Card,
  DataTable,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { RentalAgency, Vehicle, VehicleCategory } from '@africatourismgate/types';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getLocationsErrorMessage } from '../../lib/locations-errors';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function VehiclesList() {
  const agencyFilterId = useId();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [agencies, setAgencies] = useState<RentalAgency[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; vehicles: Vehicle[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const client = getApiClient();
    void Promise.all([
      client.listRentalAgencies({ page: 1, limit: 100 }),
      client.listVehicleCategories({ page: 1, limit: 100 }),
    ])
      .then(([a, c]) => {
        setAgencies(a.data);
        setCategories(c.data);
      })
      .catch(() => {
        setAgencies([]);
        setCategories([]);
      });
  }, []);

  const agencyById = useMemo(
    () => new Map(agencies.map((a) => [a.id, a.name])),
    [agencies],
  );
  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listVehicles({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        agencyId: agencyFilter || undefined,
      });
      setState({
        status: 'ready',
        vehicles: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getLocationsErrorMessage(error) });
    }
  }, [page, search, agencyFilter]);

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
    async (vehicle: Vehicle) => {
      const label = vehicle.licensePlate ?? vehicle.id.slice(0, 8);
      if (!window.confirm(`Supprimer le véhicule « ${label} » ?`)) return;
      setDeleteError(null);
      setDeletingId(vehicle.id);
      try {
        await getApiClient().deleteVehicle(vehicle.id);
        await load();
      } catch (error) {
        setDeleteError(getLocationsErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<Vehicle, unknown>[]>(
    () => [
      {
        accessorKey: 'licensePlate',
        header: 'Immatriculation',
        cell: ({ row }) => (
          <code className="font-mono text-sm">
            {row.original.licensePlate ?? '—'}
          </code>
        ),
      },
      {
        id: 'agency',
        header: 'Agence',
        cell: ({ row }) => agencyById.get(row.original.agencyId) ?? '—',
      },
      {
        id: 'category',
        header: 'Catégorie',
        cell: ({ row }) => categoryById.get(row.original.categoryId) ?? '—',
      },
      {
        id: 'price',
        header: 'Prix / jour',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatPrice(row.original.dailyPriceCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1.5">
            <Button
              href={`/produits/locations/${row.original.id}`}
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
    [agencyById, categoryById, deletingId, handleDelete],
  );

  const vehicles = state.status === 'ready' ? state.vehicles : [];
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 sm:max-w-xs">
            <Input
              type="search"
              placeholder="Rechercher par plaque…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="flex-1 sm:max-w-xs">
            <label htmlFor={agencyFilterId} className="mb-2 block text-sm font-medium">
              Agence
            </label>
            <select
              id={agencyFilterId}
              className={selectClass}
              value={agencyFilter}
              onChange={(e) => {
                setAgencyFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Toutes les agences</option>
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button href="/produits/locations/nouveau">Nouveau véhicule</Button>
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
              data={vehicles}
              isLoading={state.status === 'loading'}
              emptyMessage={
                agencyFilter || search
                  ? 'Aucun véhicule ne correspond aux filtres.'
                  : 'Aucun véhicule pour le moment.'
              }
              emptyVariant={search || agencyFilter ? 'search' : 'default'}
              getRowId={(r) => r.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="véhicule"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
