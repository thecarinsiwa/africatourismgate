'use client';

import {
  AlertDialog,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  EmptyState,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import { ApiHttpError } from '@africatourismgate/api-client';
import type { OrganizationListItem } from '@africatourismgate/types';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  formatOrganizationCount,
  formatOrganizationLegalForm,
  organizationStatusLabels,
  organizationStatusVariants,
} from '../../lib/organization-display';
import { getOrganizationsErrorMessage } from '../../lib/organizations-errors';
import { OrganizationLogo } from './organization-logo';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function OrganizationsList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        organizations: OrganizationListItem[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<OrganizationListItem | null>(null);
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

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;

    setDeleteError(null);
    setDeletingId(pendingDelete.id);
    try {
      await getApiClient().deleteOrganization(pendingDelete.id);
      setPendingDelete(null);
      await load();
    } catch (error) {
      if (error instanceof ApiHttpError && error.status === 404) {
        setPendingDelete(null);
        await load();
        return;
      }
      setDeleteError(getOrganizationsErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [load, pendingDelete]);

  const columns = useMemo<ColumnDef<OrganizationListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Organisation',
        cell: ({ row }) => {
          const org = row.original;
          return (
            <div className="flex items-center gap-3">
              <OrganizationLogo name={org.name} logoUrl={org.logoUrl} size="sm" />
              <div className="min-w-0">
                <Link
                  href={`/organisations/${org.id}`}
                  className="font-medium text-atg-fg hover:text-primary hover:underline"
                >
                  {org.name}
                </Link>
                <p className="truncate font-mono text-xs text-atg-muted">{org.slug}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <span className="text-sm text-atg-fg">
            {formatOrganizationLegalForm(row.original.legalForm)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        meta: { align: 'center' },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <DataTableBadge variant={organizationStatusVariants[status]}>
              {organizationStatusLabels[status]}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'userCount',
        header: 'Utilisateurs',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm text-atg-fg">
            {formatOrganizationCount(row.original.userCount)}
          </span>
        ),
      },
      {
        id: 'employeeCount',
        header: 'Employés',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm text-atg-fg">
            {formatOrganizationCount(row.original.employeeCount)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const org = row.original;
          const busy = deletingId === org.id;
          return (
            <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
              <DataTableActionButton action="edit" href={`/organisations/${org.id}`} />
              <DataTableActionButton
                action="delete"
                onClick={() => setPendingDelete(org)}
                disabled={busy}
                loading={busy}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const organizations = state.status === 'ready' ? state.organizations : [];
  const hasSearch = search.trim().length > 0;
  const isEmpty = state.status === 'ready' && state.total === 0;

  return (
    <div className="space-y-6">
      <div className="sm:max-w-md">
        <Input
          name="search"
          type="search"
          placeholder="Rechercher par nom ou slug…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Rechercher par nom ou slug"
        />
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
      ) : isEmpty && !isLoading ? (
        <EmptyState
          title={
            hasSearch
              ? 'Aucune organisation ne correspond à votre recherche'
              : 'Aucune organisation pour le moment'
          }
          description={
            hasSearch
              ? 'Essayez un autre nom ou slug.'
              : 'Créez une organisation partenaire pour commencer.'
          }
        />
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={organizations}
              isLoading={isLoading}
              emptyMessage={
                hasSearch
                  ? 'Aucune organisation ne correspond à votre recherche.'
                  : 'Aucune organisation pour le moment.'
              }
              emptyVariant={hasSearch ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label="Liste des organisations"
            />
          </Card>

          {state.status === 'ready' && state.totalPages > 1 ? (
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

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletingId) setPendingDelete(null);
        }}
        title="Supprimer l'organisation"
        description={
          pendingDelete
            ? `Supprimer l'organisation « ${pendingDelete.name} » ? Cette action est réversible côté base.`
            : undefined
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        loading={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
