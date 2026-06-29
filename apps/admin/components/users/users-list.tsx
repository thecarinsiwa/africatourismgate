'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useAccountStatusLabels } from '../../lib/i18n/use-module-labels';

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
import type { OrganizationListItem, Role, User, UserStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

type StatusFilter = '' | 'active' | 'suspended';

const statusVariants: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  suspended: 'warning',
  deleted: 'danger',
};

export function UsersList() {
  const { users: getUsersErrorMessage } = useAdminErrorMessages();
  const tList = useTranslations('modules.users.list');
  const tFilters = useTranslations('modules.users.filters');
  const tCommonFilters = useTranslations('modules.common.filters');
  const tColumns = useTranslations('modules.common.columns');
  const tPagination = useTranslations('modules.common.pagination');
  const statusLabels = useAccountStatusLabels();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
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
      { value: '', label: tCommonFilters('allFeminine') },
      ...organizations.map((org) => ({ value: org.id, label: org.name })),
    ],
    [organizations, tCommonFilters],
  );

  const roleOptions = useMemo(
    () => [
      { value: '', label: tCommonFilters('all') },
      ...roles.map((role) => ({ value: role.id, label: role.name })),
    ],
    [roles, tCommonFilters],
  );

  const statusOptions = useMemo(
    () => [
      { value: '', label: tCommonFilters('all') },
      { value: 'active', label: statusLabels.active },
      { value: 'suspended', label: statusLabels.suspended },
    ],
    [statusLabels, tCommonFilters],
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
  }, [page, search, statusFilter, organizationFilter, roleFilter, getUsersErrorMessage]);

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
      if (!window.confirm(tList('deleteConfirm', { email: user.email }))) {
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
    [load, tList, getUsersErrorMessage],
  );

  const columns = useMemo<ColumnDef<User, unknown>[]>(
    () => [
      {
        id: 'user',
        header: tColumns('user'),
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
        header: tColumns('status'),
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
        header: tColumns('organization'),
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
        header: tColumns('actions'),
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
    [deletingId, handleDelete, orgNameById, statusLabels, tColumns],
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
  const emptyMessage = hasFilters ? tList('emptyFiltered') : tList('emptyDefault');

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
        actions={<Button href="/utilisateurs/nouveau">{tList('newUser')}</Button>}
        filters={
          <>
            <div className="min-w-[200px] flex-1 sm:max-w-md">
              <Input
                name="search"
                type="search"
                placeholder={tCommonFilters('searchByEmailOrName')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={tCommonFilters('searchByEmailOrNameAria')}
              />
            </div>
            <div className="w-full sm:w-40">
              <Select
                label={tFilters('status')}
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
                label={tFilters('organization')}
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
                label={tFilters('role')}
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
              aria-label={tList('ariaLabel')}
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('user')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
