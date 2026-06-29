'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Card, DataTable, DataTablePagination, Input, type ColumnDef } from '@africatourismgate/ui';
import type { Permission } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useRbacPermissionActionLabels,
  useRbacPermissionDomainLabels,
} from '../../lib/i18n/use-module-labels';
import {
  formatPermissionAction,
  formatPermissionDomain,
} from '../../lib/rbac-display';
import { getApiClient } from '../../lib/auth/api';
import { RbacSubnav } from './rbac-subnav';

const PAGE_SIZE = 20;

export function PermissionsList() {
  const { rbac: getRbacErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.rbac.permissions');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tCommon = useTranslations('modules.common');
  const domainLabels = useRbacPermissionDomainLabels();
  const actionLabels = useRbacPermissionActionLabels();
  const emptyDash = tCommon('empty.dash');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; permissions: Permission[]; total: number; totalPages: number }
  >({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listPermissions({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        permissions: result.data,
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

  const columns = useMemo<ColumnDef<Permission, unknown>[]>(
    () => [
      {
        accessorKey: 'resource',
        header: t('columns.resource'),
        cell: ({ row }) =>
          formatPermissionDomain(row.original.resource, domainLabels, emptyDash),
      },
      {
        accessorKey: 'action',
        header: tCommonColumns('actions'),
        cell: ({ row }) => formatPermissionAction(row.original.action, actionLabels),
      },
      {
        accessorKey: 'code',
        header: tCommonColumns('code'),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.code}</span>
        ),
      },
      {
        accessorKey: 'description',
        header: tCommon('form.description'),
        cell: ({ row }) => (
          <span className="text-atg-muted">{row.original.description ?? emptyDash}</span>
        ),
      },
    ],
    [t, tCommonColumns, tCommon, domainLabels, actionLabels, emptyDash],
  );

  const permissions = state.status === 'ready' ? state.permissions : [];

  return (
    <div className="space-y-6">
      <RbacSubnav />
      <p className="text-sm text-atg-muted">{t('intro')}</p>
      <div className="max-w-md">
        <Input
          type="search"
          placeholder={t('searchPlaceholder')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
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
              data={permissions}
              isLoading={state.status === 'loading'}
              emptyMessage={t('empty')}
              getRowId={(p) => p.id}
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
    </div>
  );
}
