'use client';

import {
  Card,
  DataTable,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Select,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  AccountingAuditAction,
  AccountingAuditEntityType,
  AccountingAuditLog,
} from '@africatourismgate/types';
import {
  ACCOUNTING_AUDIT_ACTIONS,
  ACCOUNTING_AUDIT_ENTITY_TYPES,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { useFormatDateTime } from '../../lib/i18n/use-module-labels';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';

const PAGE_SIZE = 20;

export function AccountingAuditLogsList() {
  const t = useTranslations('modules.treasury.accounting.audit');
  const tList = useTranslations('modules.treasury.accounting.list');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const tCommon = useTranslations('modules.common');
  const formatDateTime = useFormatDateTime('mediumTime');
  const paginationLabels = useDataTablePaginationLabels();

  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState<'' | AccountingAuditEntityType>(
    '',
  );
  const [action, setAction] = useState<'' | AccountingAuditAction>('');
  const [canRead, setCanRead] = useState(true);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        logs: AccountingAuditLog[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });

  const commonErrorMessages = useMemo(
    () => ({
      network: tCommonErrors('network'),
      forbidden: tErrors('forbidden'),
      generic: tErrors('loadFailed'),
      apiStatus: (code: number) => tCommonErrors('apiStatus', { status: code }),
      accessDenied: t('accessDenied'),
    }),
    [t, tCommonErrors, tErrors],
  );

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (cancelled) return;
        setCanRead(
          me.isSuperAdmin || me.permissions.includes('accounting.audit.read'),
        );
      })
      .catch(() => {
        if (!cancelled) setCanRead(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    if (!canRead) {
      setState({ status: 'error', message: t('accessDenied') });
      return;
    }
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listAccountingAuditLogs({
        page,
        limit: PAGE_SIZE,
        entityType: entityType || undefined,
        action: action || undefined,
      });
      setState({
        status: 'ready',
        logs: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({
        status: 'error',
        message: resolveUnknownApiError(error, commonErrorMessages, {
          useParseApiMessage: true,
          forbidden: tList('accessDenied'),
        }),
      });
    }
  }, [canRead, page, entityType, action, t, tList, commonErrorMessages]);

  useEffect(() => {
    void load();
  }, [load]);

  const entityTypeOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.all') },
      ...ACCOUNTING_AUDIT_ENTITY_TYPES.map((type) => ({
        value: type,
        label: type,
      })),
    ],
    [tCommon],
  );

  const actionOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.all') },
      ...ACCOUNTING_AUDIT_ACTIONS.map((value) => ({
        value,
        label: value,
      })),
    ],
    [tCommon],
  );

  const columns = useMemo<ColumnDef<AccountingAuditLog, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: t('columns.createdAt'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: 'action',
        header: t('columns.action'),
        cell: ({ row }) => (
          <DataTableBadge variant="default">{row.original.action}</DataTableBadge>
        ),
      },
      {
        accessorKey: 'entityType',
        header: t('columns.entityType'),
        cell: ({ row }) => row.original.entityType,
      },
      {
        accessorKey: 'entityId',
        header: t('columns.entityId'),
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.entityId.slice(0, 8)}…
          </span>
        ),
      },
      {
        id: 'actor',
        header: t('columns.actor'),
        cell: ({ row }) =>
          row.original.actorId
            ? `${row.original.actorType}:${row.original.actorId.slice(0, 8)}…`
            : row.original.actorType,
      },
    ],
    [formatDateTime, t],
  );

  const logs = state.status === 'ready' ? state.logs : [];
  const total = state.status === 'ready' ? state.total : 0;
  const totalPages = state.status === 'ready' ? state.totalPages : 1;
  const activeFilterCount = [entityType !== '', action !== ''].filter(
    Boolean,
  ).length;

  return (
    <div className="space-y-4">
      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={() => {
          setEntityType('');
          setAction('');
          setPage(1);
        }}
        clearLabel={tCommon('filters.clearAll')}
        applyLabel={tCommon('filters.apply')}
        toggleLabel={tCommon('filters.toggle')}
        filters={
          <>
            <div className="w-full sm:w-52">
              <Select
                label={t('filters.entityType')}
                value={entityType}
                options={entityTypeOptions}
                onChange={(e) => {
                  setEntityType(
                    e.target.value as '' | AccountingAuditEntityType,
                  );
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-52">
              <Select
                label={t('filters.action')}
                value={action}
                options={actionOptions}
                onChange={(e) => {
                  setAction(e.target.value as '' | AccountingAuditAction);
                  setPage(1);
                }}
              />
            </div>
          </>
        }
      />

      {state.status === 'error' ? (
        <Card className="p-6">
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        </Card>
      ) : null}

      <DataTable
        columns={columns}
        data={logs}
        loading={state.status === 'loading'}
        emptyMessage={t('empty')}
      />
      <DataTablePagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        labels={paginationLabels}
      />
    </div>
  );
}
