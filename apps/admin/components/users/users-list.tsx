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
  DataTableAdjustButton,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Input,
  Select,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { OrganizationListItem, Role, User, UserStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { exportCsv } from '../../lib/export-csv';
import { UserRoleModal } from './user-role-modal';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

type StatusFilter = '' | 'active' | 'suspended';

const statusVariants: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  suspended: 'warning',
  deleted: 'danger',
};

export function UsersList() {
  const searchParams = useSearchParams();
  const { users: getUsersErrorMessage } = useAdminErrorMessages();
  const tList = useTranslations('modules.users.list');
  const tFilters = useTranslations('modules.users.filters');
  const tForm = useTranslations('modules.users.form');
  const tRoles = useTranslations('modules.users.roles');
  const tCommonFilters = useTranslations('modules.common.filters');
  const tColumns = useTranslations('modules.common.columns');
  const tPagination = useTranslations('modules.common.pagination');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tExport = useTranslations('modules.common.exportCsv');
  const tEmpty = useTranslations('modules.common.empty');
  const statusLabels = useAccountStatusLabels();
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [withoutRoleFilter, setWithoutRoleFilter] = useState(false);
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
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);

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

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'active' || status === 'suspended') {
      setStatusFilter(status);
    }
    const withoutRole = searchParams.get('withoutRole');
    if (withoutRole === '1' || withoutRole === 'true') {
      setWithoutRoleFilter(true);
    }
  }, [searchParams]);

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
        withoutRole: withoutRoleFilter || undefined,
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
  }, [page, search, statusFilter, organizationFilter, roleFilter, withoutRoleFilter, getUsersErrorMessage]);

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

  const handleDeleteRequest = useCallback((user: User) => {
    setConfirmTarget(user);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const user = confirmTarget;
    setConfirmTarget(null);
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
  }, [confirmTarget, load, getUsersErrorMessage]);

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
        meta: { align: 'center', hideOnMobile: true },
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
        meta: { hideOnMobile: true },
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
              <DataTableAdjustButton
                label={tRoles('manageAction')}
                onClick={() => setRoleModalUser(user)}
              />
              <DataTableActionButton
                action="delete"
                onClick={() => handleDeleteRequest(user)}
                disabled={deletingId === user.id}
                loading={deletingId === user.id}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId, handleDeleteRequest, orgNameById, statusLabels, tColumns, tRoles],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const users = state.status === 'ready' ? state.users : [];
  const activeFilterCount = [
    search.trim().length > 0,
    statusFilter !== '',
    organizationFilter !== '',
    roleFilter !== '',
    withoutRoleFilter,
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;
  const emptyMessage = hasFilters ? tList('emptyFiltered') : tList('emptyDefault');
  const emptyDash = tEmpty('dash');

  const handleExportCsv = useCallback(() => {
    if (users.length === 0) return;
    const date = new Date().toISOString().slice(0, 10);
    exportCsv({
      filename: `users-${date}.csv`,
      columns: [
        { header: tForm('email'), value: (row) => row.email },
        { header: tForm('firstName'), value: (row) => row.firstName ?? '' },
        { header: tForm('lastName'), value: (row) => row.lastName ?? '' },
        {
          header: tColumns('status'),
          value: (row) => statusLabels[row.status] ?? row.status,
        },
        {
          header: tColumns('organization'),
          value: (row) =>
            row.organizationId
              ? (orgNameById.get(row.organizationId) ?? row.organizationId)
              : emptyDash,
        },
      ],
      rows: users,
    });
    toast({ variant: 'success', message: tExport('success') });
  }, [emptyDash, orgNameById, statusLabels, tColumns, tExport, tForm, toast, users]);

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('');
    setOrganizationFilter('');
    setRoleFilter('');
    setWithoutRoleFilter(false);
    setPage(1);
  }, []);

  return (
    <>
    <UserRoleModal
      user={roleModalUser}
      open={roleModalUser !== null}
      onOpenChange={(open) => {
        if (!open) setRoleModalUser(null);
      }}
      onChanged={() => void load()}
    />
    {confirmTarget ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        onClick={(e) => { if (e.target === e.currentTarget) setConfirmTarget(null); }}
      >
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-start gap-4 p-6 pb-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="delete-modal-title" className="text-base font-semibold text-neutral-900 dark:text-white">
                {tList('deleteTitle')}
              </h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {tList('deleteConfirm', { email: confirmTarget.email })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmTarget(null)}
              className="ml-2 shrink-0 rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
              aria-label={tList('cancel')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User info */}
          <div className="mx-6 mb-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-sm font-semibold text-neutral-600 dark:text-neutral-300 uppercase">
              {confirmTarget.firstName?.[0] ?? confirmTarget.email[0]}
            </div>
            <div className="min-w-0">
              {(confirmTarget.firstName || confirmTarget.lastName) ? (
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                  {[confirmTarget.firstName, confirmTarget.lastName].filter(Boolean).join(' ')}
                </p>
              ) : null}
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{confirmTarget.email}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800 px-6 py-4">
            <button
              type="button"
              onClick={() => setConfirmTarget(null)}
              className="inline-flex h-9 items-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              {tList('cancel')}
            </button>
            <button
              type="button"
              onClick={() => void handleDeleteConfirm()}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {tList('deleteConfirmButton')}
            </button>
          </div>
        </div>
      </div>
    ) : null}
    <div className="space-y-6">
      <FilterBar
        activeCount={activeFilterCount}
        onClear={handleClearFilters}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading || users.length === 0}
              onClick={handleExportCsv}
            >
              {tExport('button')}
            </Button>
            <Button href="/utilisateurs/nouveau">{tList('newUser')}</Button>
          </div>
        }
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
            <label className="flex min-h-[44px] items-center gap-2 text-sm text-atg-fg">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-atg-border text-atg-primary focus:ring-atg-primary"
                checked={withoutRoleFilter}
                onChange={(e) => {
                  setWithoutRoleFilter(e.target.checked);
                  setPage(1);
                }}
              />
              {tFilters('withoutRole')}
            </label>
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
              loadingMessage={tDataTable('loading')}
              emptyMessage={emptyMessage}
              emptyVariant={hasFilters ? 'search' : 'default'}
              expandRowLabel={tDataTable('expandRow')}
              collapseRowLabel={tDataTable('collapseRow')}
              expandRowAriaLabel={tDataTable('expandRowAria')}
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
    </>
  );
}
