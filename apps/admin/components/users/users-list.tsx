'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableBadge,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Organization, User, UserStatus } from '@africatourismgate/types';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getUsersErrorMessage } from '../../lib/users-errors';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type StatusFilter = '' | 'active' | 'suspended';

const statusLabels: Record<UserStatus, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  deleted: 'Supprimé',
};

const statusVariants: Record<UserStatus, 'success' | 'muted' | 'danger'> = {
  active: 'success',
  suspended: 'muted',
  deleted: 'danger',
};

export function UsersList() {
  const statusFilterId = useId();
  const orgFilterId = useId();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        users: User[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadOrganizations() {
      try {
        const result = await getApiClient().listOrganizations({ page: 1, limit: 200 });
        if (!cancelled) {
          setOrganizations(result.data);
        }
      } catch {
        if (!cancelled) {
          setOrganizations([]);
        }
      }
    }
    void loadOrganizations();
    return () => {
      cancelled = true;
    };
  }, []);

  const orgNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const org of organizations) {
      map.set(org.id, org.name);
    }
    return map;
  }, [organizations]);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listUsers({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        organizationId: organizationFilter || undefined,
      });
      setState({
        status: 'ready',
        users: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getUsersErrorMessage(error) });
    }
  }, [page, search, statusFilter, organizationFilter]);

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
    async (user: User) => {
      if (
        !window.confirm(
          `Supprimer l’utilisateur « ${user.email} » ? Cette action est réversible côté base.`,
        )
      ) {
        return;
      }
      setDeleteError(null);
      setDeletingId(user.id);
      try {
        await getApiClient().deleteUser(user.id);
        await load();
      } catch (error) {
        setDeleteError(getUsersErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load],
  );

  const columns = useMemo<ColumnDef<User, unknown>[]>(
    () => [
      {
        accessorKey: 'email',
        header: 'E-mail',
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.email}</span>
        ),
      },
      {
        id: 'name',
        header: 'Nom',
        cell: ({ row }) => (
          <span className="text-atg-fg">
            {row.original.firstName} {row.original.lastName}
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
            <DataTableBadge variant={statusVariants[status]}>
              {statusLabels[status]}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'organization',
        header: 'Organisation',
        cell: ({ row }) => {
          const orgId = row.original.organizationId;
          if (!orgId) {
            return <span className="text-atg-muted">—</span>;
          }
          return (
            <span className="text-atg-muted">{orgNameById.get(orgId) ?? orgId.slice(0, 8)}</span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex justify-end gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
              <Button href={`/utilisateurs/${user.id}`} variant="ghost" size="sm">
                Modifier
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void handleDelete(user)}
                disabled={deletingId === user.id}
                loading={deletingId === user.id}
                loadingText="…"
                className="!text-red-600 hover:!bg-red-50 hover:!text-red-700 dark:!text-red-400 dark:hover:!bg-red-950/30"
              >
                Supprimer
              </Button>
            </div>
          );
        },
      },
    ],
    [deletingId, handleDelete, orgNameById],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const users = state.status === 'ready' ? state.users : [];
  const hasFilters =
    search.trim().length > 0 || statusFilter !== '' || organizationFilter !== '';
  const emptyMessage = hasFilters
    ? 'Aucun utilisateur ne correspond à vos critères.'
    : 'Aucun utilisateur pour le moment.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[200px] flex-1 sm:max-w-md">
            <Input
              name="search"
              type="search"
              placeholder="Rechercher par e-mail ou nom…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Rechercher par e-mail ou nom"
            />
          </div>
          <div>
            <label htmlFor={statusFilterId} className="mb-2 block text-sm font-medium text-atg-fg">
              Statut
            </label>
            <select
              id={statusFilterId}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(1);
              }}
              className="w-full min-w-[140px] rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Tous</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>
          <div>
            <label htmlFor={orgFilterId} className="mb-2 block text-sm font-medium text-atg-fg">
              Organisation
            </label>
            <select
              id={orgFilterId}
              value={organizationFilter}
              onChange={(e) => {
                setOrganizationFilter(e.target.value);
                setPage(1);
              }}
              className="w-full min-w-[180px] rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Toutes</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button href="/utilisateurs/nouveau">Nouvel utilisateur</Button>
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
              data={users}
              isLoading={isLoading}
              emptyMessage={emptyMessage}
              emptyVariant={hasFilters ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label="Liste des utilisateurs"
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="utilisateur"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
