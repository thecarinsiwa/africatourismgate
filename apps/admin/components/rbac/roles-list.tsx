'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  EmptyState,
  FilterBar,
  Input,
  Select,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Role } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { RoleBadge } from './role-badge';
import { RbacSubnav } from './rbac-subnav';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type RoleTypeFilter = '' | 'system' | 'custom';

export function RolesList() {
  const { rbac: getRbacErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.rbac.roles');
  const tCommon = useTranslations('modules.common');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tActions = useTranslations('common.actions');
  const { toast } = useToast();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<RoleTypeFilter>('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; roles: Role[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Role | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listRoles({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        includeSystem: true,
      });
      setState({
        status: 'ready',
        roles: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getRbacErrorMessage(error) });
    }
  }, [page, search, getRbacErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        const q = searchInput.trim();
        if (prev !== q) setPage(1);
        return q;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const typeOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.all') },
      { value: 'system', label: t('type.system') },
      { value: 'custom', label: t('type.custom') },
    ],
    [t, tCommon],
  );

  const activeFilterCount = [search.trim().length > 0, typeFilter !== ''].filter(
    Boolean,
  ).length;

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setTypeFilter('');
    setPage(1);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete || pendingDelete.isSystem) return;
    setDeletingId(pendingDelete.id);
    try {
      await getApiClient().deleteRole(pendingDelete.id);
      toast({
        title: t('toast.deletedTitle'),
        message: t('toast.deletedMessage', { name: pendingDelete.name }),
        variant: 'success',
      });
      setPendingDelete(null);
      await load();
    } catch (error) {
      toast({
        title: t('toast.deleteFailedTitle'),
        message: getRbacErrorMessage(error),
        variant: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  }, [pendingDelete, load, toast, t, getRbacErrorMessage]);

  const columns = useMemo<ColumnDef<Role, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: tCommonColumns('code'),
        cell: ({ row }) => (
          <Link
            href={`/systeme/roles/${row.original.id}`}
            className="font-mono text-sm text-atg-fg hover:text-primary hover:underline"
          >
            {row.original.code}
          </Link>
        ),
      },
      {
        accessorKey: 'name',
        header: tCommonColumns('name'),
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/systeme/roles/${row.original.id}`} className="hover:opacity-90">
              <RoleBadge code={row.original.code} name={row.original.name} />
            </Link>
          </div>
        ),
      },
      {
        id: 'type',
        header: tCommonColumns('type'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <DataTableBadge variant={row.original.isSystem ? 'muted' : 'success'}>
            {row.original.isSystem ? t('type.system') : t('type.custom')}
          </DataTableBadge>
        ),
      },
      {
        id: 'actions',
        header: tCommonColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => {
          const role = row.original;
          const busy = deletingId === role.id;
          return (
            <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
              <DataTableActionButton
                action={role.isSystem ? 'view' : 'edit'}
                label={role.isSystem ? tActions('view') : tActions('edit')}
                href={`/systeme/roles/${role.id}`}
              />
              {!role.isSystem ? (
                <DataTableActionButton
                  action="delete"
                  label={tActions('delete')}
                  onClick={() => setPendingDelete(role)}
                  disabled={busy}
                  loading={busy}
                />
              ) : null}
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId, t, tActions, tCommonColumns],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const rolesRaw = state.status === 'ready' ? state.roles : [];
  const roles =
    typeFilter === 'system'
      ? rolesRaw.filter((role) => role.isSystem)
      : typeFilter === 'custom'
        ? rolesRaw.filter((role) => !role.isSystem)
        : rolesRaw;
  const hasActiveFilters = activeFilterCount > 0;
  const isEmpty =
    state.status === 'ready' &&
    (typeFilter ? roles.length === 0 : state.total === 0);

  return (
    <div className="space-y-6">
      <RbacSubnav />

      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={handleClearFilters}
        clearLabel={tCommon('filters.clearAll')}
        applyLabel={tCommon('filters.apply')}
        toggleLabel={tCommon('filters.toggle')}
        filters={
          <>
            <div className="min-w-[200px] flex-1 sm:max-w-md">
              <Input
                name="search"
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={t('searchPlaceholder')}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label={tCommonColumns('type')}
                value={typeFilter}
                options={typeOptions}
                onChange={(e) => {
                  setTypeFilter(e.target.value as RoleTypeFilter);
                  setPage(1);
                }}
              />
            </div>
          </>
        }
      />

      {isError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : isEmpty && !isLoading ? (
        <EmptyState
          title={hasActiveFilters ? t('emptyTitleSearch') : t('emptyTitleDefault')}
          description={
            hasActiveFilters ? t('emptyDescriptionSearch') : t('emptyDescriptionDefault')
          }
        />
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={roles}
              isLoading={isLoading}
              emptyMessage={
                hasActiveFilters ? t('emptyTableSearch') : t('emptyTableDefault')
              }
              emptyVariant={hasActiveFilters ? 'search' : 'default'}
              getRowId={(r) => r.id}
              aria-label={t('ariaLabel')}
            />
          </Card>
          {state.status === 'ready' && state.totalPages > 1 ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={t('paginationItem')}
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
        title={t('deleteDialog.title')}
        description={
          pendingDelete
            ? t('deleteDialog.description', { name: pendingDelete.name })
            : undefined
        }
        confirmLabel={tActions('delete')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
