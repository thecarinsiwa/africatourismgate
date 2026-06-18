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
  Input,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Role } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { RoleBadge } from './role-badge';
import { RbacSubnav } from './rbac-subnav';

const PAGE_SIZE = 20;

export function RolesList() {
  const { rbac: getRbacErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.rbac.roles');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tActions = useTranslations('common.actions');
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
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
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

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
          <span className="font-mono text-sm text-atg-fg">{row.original.code}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: tCommonColumns('name'),
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge code={row.original.code} name={row.original.name} />
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
          return (
            <DataTableActions>
              <DataTableActionButton
                action={role.isSystem ? 'view' : 'edit'}
                href={`/systeme/roles/${role.id}`}
              />
              {!role.isSystem ? (
                <DataTableActionButton
                  action="delete"
                  onClick={() => setPendingDelete(role)}
                  disabled={deletingId === role.id}
                  loading={deletingId === role.id}
                />
              ) : null}
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId, t, tCommonColumns],
  );

  const roles = state.status === 'ready' ? state.roles : [];

  return (
    <div className="space-y-6">
      <RbacSubnav />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-[200px] flex-1 sm:max-w-md">
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={roles}
              isLoading={state.status === 'loading'}
              emptyMessage={t('empty')}
              getRowId={(r) => r.id}
              aria-label={t('ariaLabel')}
            />
          </Card>
          {state.status === 'ready' ? (
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
          if (!open) setPendingDelete(null);
        }}
        title={t('deleteDialog.title')}
        description={
          pendingDelete
            ? t('deleteDialog.description', { name: pendingDelete.name })
            : undefined
        }
        confirmLabel={tActions('delete')}
        variant="danger"
        loading={deletingId !== null}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
