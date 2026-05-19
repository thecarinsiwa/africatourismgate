'use client';

import {
  Button,
  Card,
  cn,
  DataTable,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Organization, OrganizationStatus } from '@africatourismgate/types';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getOrganizationsErrorMessage } from '../../lib/organizations-errors';

const PAGE_SIZE = 20;

const statusLabels: Record<OrganizationStatus, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  deleted: 'Supprimé',
};

const statusStyles: Record<OrganizationStatus, string> = {
  active: 'bg-primary/10 text-primary',
  suspended: 'bg-atg-border/80 text-atg-muted',
  deleted: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
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
        header: 'Nom',
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-atg-muted">{row.original.slug}</span>
        ),
      },
      {
        accessorKey: 'currency',
        header: 'Devise',
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                statusStyles[status],
              )}
            >
              {statusLabels[status]}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const org = row.original;
          return (
            <div className="flex justify-end gap-2">
              <Link
                href={`/organisations/${org.id}`}
                className="text-sm font-medium text-primary hover:text-primary-hover"
              >
                Modifier
              </Link>
              <button
                type="button"
                onClick={() => void handleDelete(org)}
                disabled={deletingId === org.id}
                className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
              >
                {deletingId === org.id ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          );
        },
      },
    ],
    [deletingId, handleDelete],
  );

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const organizations = state.status === 'ready' ? state.organizations : [];
  const emptyMessage =
    search.trim().length > 0
      ? 'Aucune organisation ne correspond à votre recherche.'
      : 'Aucune organisation.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-col gap-2 sm:max-w-md sm:flex-row">
          <Input
            name="search"
            placeholder="Rechercher par nom ou slug…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Rechercher par nom ou slug"
          />
          <Button type="submit" variant="secondary" className="shrink-0">
            Rechercher
          </Button>
        </form>
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
          <Card variant="dashboard" padding="none">
            <DataTable
              columns={columns}
              data={organizations}
              isLoading={isLoading}
              emptyMessage={emptyMessage}
              getRowId={(row) => row.id}
              aria-label="Liste des organisations"
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
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
