'use client';

import {
  Avatar,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Input,
  Select,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Organization, Role, User, UserStatus } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getUsersErrorMessage } from '../../lib/users-errors';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

type StatusFilter = '' | 'active' | 'suspended';

const statusLabels: Record<UserStatus, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  deleted: 'Supprimé',
};

const statusVariants: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  suspended: 'warning',
  deleted: 'danger',
};

export function UsersList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
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
    async function loadFilters() {
      try {
        const [orgsResult, rolesResult] = await Promise.all([
          getApiClient().listOrganizations({ page: 1, limit: 100 }),
          getApiClient().listRoles({ page: 1, limit: 100 }),
        ]);
        if (!cancelled) {
          setOrganizations(orgsResult.data);
          setRoles(rolesResult.data);
        }
      } catch {
        if (!cancelled) {
          setOrganizations([]);
          setRoles([]);
        }
      }
    }
    void loadFilters();
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

  const organizationOptions = useMemo(
    () => [
      { value: '', label: 'Toutes' },
      ...organizations.map((org) => ({ value: org.id, label: org.name })),
    ],
    [organizations],
  );

  const roleOptions = useMemo(
    () => [
      { value: '', label: 'Tous' },
      ...roles.map((role) => ({ value: role.id, label: role.name })),
    ],
    [roles],
  );

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Tous' },
      { value: 'active', label: 'Actif' },
      { value: 'suspended', label: 'Suspendu' },
    ],
    [],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listUsers({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        organizationId: organizationFilter || undefined,
        roleId: roleFilter || undefined,
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
  }, [page, search, statusFilter, organizationFilter, roleFilter]);

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
          `Supprimer l'utilisateur « ${user.email} » ? Cette action est réversible côté base.`,
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
        id: 'user',
        header: 'Utilisateur',
        cell: ({ row }) => {
          const user = row.original;
          const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
          return (
            <div className="flex items-center gap-3">
              <Avatar
                email={user.email}
                firstName={user.firstName}
                lastName={user.lastName}
                size="md"
              />
              <div className="min-w-0">
                <span className="block truncate font-medium text-atg-fg">
                  {fullName || user.email}
                </span>
                <span className="block truncate text-xs text-atg-muted">{user.email}</span>
              </div>
            </div>
          );
        },
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
            <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
              <DataTableActionButton action="view" href={`/utilisateurs/${user.id}`} />
              <DataTableActionButton action="edit" href={`/utilisateurs/${user.id}`} />
              <DataTableActionButton
                action="delete"
                onClick={() => void handleDelete(user)}
                disabled={deletingId === user.id}
                loading={deletingId === user.id}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId, handleDelete, orgNameById],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const users = state.status === 'ready' ? state.users : [];
  const activeFilterCount = [
    search.trim().length > 0,
    statusFilter !== '',
    organizationFilter !== '',
    roleFilter !== '',
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;
  const emptyMessage = hasFilters
    ? 'Aucun utilisateur ne correspond à vos critères.'
    : 'Aucun utilisateur pour le moment.';

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('');
    setOrganizationFilter('');
    setRoleFilter('');
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <FilterBar
        activeCount={activeFilterCount}
        onClear={handleClearFilters}
        actions={<Button href="/utilisateurs/nouveau">Nouvel utilisateur</Button>}
        filters={
          <>
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
            <div className="w-full sm:w-40">
              <Select
                label="Statut"
                value={statusFilter}
                options={statusOptions}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                label="Organisation"
                value={organizationFilter}
                options={organizationOptions}
                onChange={(e) => {
                  setOrganizationFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                label="Rôle"
                value={roleFilter}
                options={roleOptions}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </>
        }
      />

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
