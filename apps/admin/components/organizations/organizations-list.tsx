'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import { ApiHttpError } from '@africatourismgate/api-client';
import type { Organization, OrganizationStatus } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getOrganizationsErrorMessage } from '../../lib/organizations-errors';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const statusLabels: Record<OrganizationStatus, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  deleted: 'Supprimé',
};

const statusVariants: Record<OrganizationStatus, 'success' | 'muted' | 'danger'> = {
  active: 'success',
  suspended: 'muted',
  deleted: 'danger',
};

export function OrganizationsList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        organizations: Organization[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listOrganizations({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        organizations: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getOrganizationsErrorMessage(error) });
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
    async (org: Organization) => {
      if (
        !window.confirm(
          `Supprimer l’organisation « ${org.name} » ? Cette action est réversible côté base.`,
        )
      ) {
        return;
      }
      setDeleteError(null);
      setDeletingId(org.id);
      try {
        await getApiClient().deleteOrganization(org.id);
        await load();
      } catch (error) {
        if (error instanceof ApiHttpError && error.status === 404) {
          await load();
          return;
        }
        setDeleteError(getOrganizationsErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<Organization, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Organisation',
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
        accessorKey: 'currency',
        header: 'Devise',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="tabular-nums text-atg-muted">{row.original.currency}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        meta: { align: 'center' },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <DataTableBadge variant={statusVariants[status]}>
              {statusLabels[status]}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const org = row.original;
          return (
            <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
              <DataTableActionButton action="edit" href={`/organisations/${org.id}`} />
              <DataTableActionButton
                action="delete"
                onClick={() => void handleDelete(org)}
                disabled={deletingId === org.id}
                loading={deletingId === org.id}
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
  const organizations = state.status === 'ready' ? state.organizations : [];
  const emptyMessage =
    search.trim().length > 0
      ? 'Aucune organisation ne correspond à votre recherche.'
      : 'Aucune organisation pour le moment.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <Input
            name="search"
            type="search"
            placeholder="Rechercher par nom ou slug…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Rechercher par nom ou slug"
          />
        </div>
        <Button href="/organisations/nouveau">Nouvelle organisation</Button>
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
              data={organizations}
              isLoading={isLoading}
              emptyMessage={emptyMessage}
              emptyVariant={search.trim().length > 0 ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label="Liste des organisations"
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="organisation"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
