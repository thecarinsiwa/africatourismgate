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
import type { Destination } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getDestinationsErrorMessage } from '../../lib/destinations-errors';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function DestinationsList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        destinations: Destination[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listDestinations({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        destinations: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getDestinationsErrorMessage(error) });
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== query) {
          setPage(1);
        }
        return query;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = useCallback(
    async (destination: Destination) => {
      if (
        !window.confirm(
          `Supprimer la destination « ${destination.name} » ? Les points d’intérêt associés seront également supprimés.`,
        )
      ) {
        return;
      }
      setDeleteError(null);
      setDeletingId(destination.id);
      try {
        await getApiClient().deleteDestination(destination.id);
        await load();
      } catch (error) {
        setDeleteError(getDestinationsErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<Destination, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Destination',
        cell: ({ row }) => {
          const name = row.original.name;
          const initial = name.trim().charAt(0).toUpperCase() || '?';
          return (
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/15"
                aria-hidden
              >
                {initial}
              </span>
              <span className="font-medium text-atg-fg">{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => (
          <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-xs text-atg-muted ring-1 ring-atg-border/60">
            {row.original.slug}
          </code>
        ),
      },
      {
        accessorKey: 'countryCode',
        header: 'Pays',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="font-mono text-sm tabular-nums text-atg-muted">
            {row.original.countryCode}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const destination = row.original;
          return (
            <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
              <DataTableActionButton action="edit" href={`/produits/destinations/${destination.id}`} />
              <DataTableActionButton
                action="delete"
                onClick={() => void handleDelete(destination)}
                disabled={deletingId === destination.id}
                loading={deletingId === destination.id}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId, handleDelete],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const destinations = state.status === 'ready' ? state.destinations : [];
  const emptyMessage =
    search.trim().length > 0
      ? 'Aucune destination ne correspond à votre recherche.'
      : 'Aucune destination pour le moment.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <Input
            name="search"
            type="search"
            placeholder="Rechercher par nom, slug ou pays…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Rechercher une destination"
          />
        </div>
        <Button href="/produits/destinations/nouveau">Nouvelle destination</Button>
      </div>

      {deleteError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {deleteError}
        </p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={destinations}
              isLoading={isLoading}
              emptyMessage={emptyMessage}
              emptyVariant={search.trim().length > 0 ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label="Liste des destinations"
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="destination"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
