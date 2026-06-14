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
import type { Activity, ActivityProvider, Destination } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getActivitiesErrorMessage } from '../../lib/activities-errors';
import {
  ActivityDifficultyBadge,
  ActivityDurationBadge,
} from './activity-meta-badges';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function ActivitiesList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [providers, setProviders] = useState<ActivityProvider[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; activities: Activity[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    void getApiClient()
      .listDestinations({ page: 1, limit: 100 })
      .then((r) => setDestinations(r.data))
      .catch(() => setDestinations([]));
    void getApiClient()
      .listActivityProviders({ page: 1, limit: 100 })
      .then((r) => setProviders(r.data))
      .catch(() => setProviders([]));
  }, []);

  const providerById = useMemo(
    () => new Map(providers.map((p) => [p.id, p.name])),
    [providers],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listActivities({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        destinationId: destinationFilter || undefined,
      });
      setState({
        status: 'ready',
        activities: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getActivitiesErrorMessage(error) });
    }
  }, [page, search, destinationFilter]);

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
    async (activity: Activity) => {
      if (!window.confirm(`Supprimer l’activité « ${activity.title} » ?`)) return;
      setDeleteError(null);
      setDeletingId(activity.id);
      try {
        await getApiClient().deleteActivity(activity.id);
        await load();
      } catch (error) {
        setDeleteError(getActivitiesErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<Activity, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Activité',
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.title}</span>
        ),
      },
      {
        id: 'provider',
        header: 'Fournisseur',
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {providerById.get(row.original.providerId) ?? row.original.providerId}
          </span>
        ),
      },
      {
        id: 'price',
        header: 'Prix',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatPrice(row.original.priceCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'duration',
        header: 'Durée',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <ActivityDurationBadge durationMinutes={row.original.durationMinutes} />
        ),
      },
      {
        id: 'difficulty',
        header: 'Difficulté',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <ActivityDifficultyBadge difficultyLevel={row.original.difficultyLevel} />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const activity = row.original;
          return (
            <DataTableActions>
              <DataTableActionButton action="edit" href={`/produits/activites/${activity.id}`} />
              <DataTableActionButton
                action="delete"
                onClick={() => void handleDelete(activity)}
                disabled={deletingId === activity.id}
                loading={deletingId === activity.id}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId, handleDelete, providerById],
  );

  const activities = state.status === 'ready' ? state.activities : [];
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 sm:max-w-md">
            <Input
              type="search"
              placeholder="Rechercher par titre…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="sm:w-56">
            <label className="mb-2 block text-sm font-medium text-atg-fg">Destination</label>
            <select
              value={destinationFilter}
              onChange={(e) => {
                setDestinationFilter(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">Toutes</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/produits/activites/fournisseurs" variant="outline">
            Fournisseurs
          </Button>
          <Button href="/produits/activites/nouveau">Nouvelle activité</Button>
        </div>
      </div>

      {deleteError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {deleteError}
        </p>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={activities}
              isLoading={state.status === 'loading'}
              emptyMessage="Aucune activité pour le moment."
              getRowId={(row) => row.id}
              aria-label="Liste des activités"
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="activité"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
