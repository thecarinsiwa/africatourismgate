'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Modal,
  Select,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  TreasuryAuditAction,
  TreasuryAuditEntityType,
  TreasuryAuditLog,
} from '@africatourismgate/types';
import {
  TREASURY_AUDIT_ACTIONS,
  TREASURY_AUDIT_ENTITY_TYPES,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { useFormatDateTime } from '../../lib/i18n/use-module-labels';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';

const PAGE_SIZE = 20;

function treasuryAuditEntityHref(
  entityType: TreasuryAuditEntityType,
  entityId: string,
): string | null {
  switch (entityType) {
    case 'fund_entry':
      return `/tresorerie/entrees/${entityId}/voir`;
    case 'fund_exit':
      return `/tresorerie/sorties/${entityId}/voir`;
    case 'expense_request':
      return `/tresorerie/besoins/${entityId}/voir`;
    case 'budget':
      return `/tresorerie/budgets/${entityId}/voir`;
    case 'external_collaborator':
      return '/tresorerie/externes';
    default:
      return null;
  }
}

function actionBadgeVariant(
  action: TreasuryAuditAction,
): 'danger' | 'success' | 'warning' | 'muted' | 'default' {
  if (action === 'void' || action === 'deactivate' || action === 'revoke_token') {
    return 'danger';
  }
  if (action === 'create' || action === 'activate' || action === 'invite') {
    return 'success';
  }
  if (action === 'transition') {
    return 'warning';
  }
  return 'default';
}

function formatJson(value: Record<string, unknown> | null): string {
  if (!value || Object.keys(value).length === 0) {
    return '—';
  }
  return JSON.stringify(value, null, 2);
}

function AuditDiffModal({
  log,
  open,
  onOpenChange,
}: {
  log: TreasuryAuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('modules.treasury.audit');
  const tActions = useTranslations('common.actions');

  if (!log) return null;

  const actionLabel = t(`actions.${log.action}`);
  const entityLabel = t(`entityTypes.${log.entityType}`);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('diffModalTitle')}
      description={`${entityLabel} · ${actionLabel}`}
      showClose
      className="max-w-4xl"
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
              {t('oldJson')}
            </p>
            <pre className="max-h-[min(28rem,50vh)] overflow-auto rounded-lg border border-atg-border/80 bg-atg-elevated p-4 text-xs leading-relaxed text-atg-fg">
              {formatJson(log.oldJson)}
            </pre>
          </div>
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
              {t('newJson')}
            </p>
            <pre className="max-h-[min(28rem,50vh)] overflow-auto rounded-lg border border-atg-border/80 bg-atg-elevated p-4 text-xs leading-relaxed text-atg-fg">
              {formatJson(log.newJson)}
            </pre>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {tActions('close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function TreasuryAuditLogsList() {
  const t = useTranslations('modules.treasury.audit');
  const tList = useTranslations('modules.treasury.audit.list');
  const tColumns = useTranslations('modules.treasury.audit.list.columns');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const formatDateTime = useFormatDateTime('mediumTime');
  const paginationLabels = useDataTablePaginationLabels();
  const emptyDash = tCommon('empty.dash');

  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState<'' | TreasuryAuditEntityType>('');
  const [action, setAction] = useState<'' | TreasuryAuditAction>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [canRead, setCanRead] = useState(true);
  const [detailLog, setDetailLog] = useState<TreasuryAuditLog | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        logs: TreasuryAuditLog[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });

  const commonErrorMessages = useMemo(
    () => ({
      network: tCommonErrors('network'),
      forbidden: tErrors('forbidden'),
      generic: tErrors('loadFailed'),
      apiStatus: (status: number) => tCommonErrors('apiStatus', { status }),
      accessDenied: tList('accessDenied'),
    }),
    [tList, tCommonErrors, tErrors],
  );

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (cancelled) return;
        setCanRead(
          me.isSuperAdmin || me.permissions.includes('treasury.audit.read'),
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
      setState({
        status: 'error',
        message: tList('accessDenied'),
      });
      return;
    }
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listTreasuryAuditLogs({
        page,
        limit: PAGE_SIZE,
        entityType: entityType || undefined,
        action: action || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
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
  }, [
    canRead,
    page,
    entityType,
    action,
    dateFrom,
    dateTo,
    tList,
    commonErrorMessages,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeFilterCount = [
    entityType !== '',
    action !== '',
    dateFrom !== '',
    dateTo !== '',
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;

  const handleClearFilters = useCallback(() => {
    setEntityType('');
    setAction('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }, []);

  const entityTypeOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.all') },
      ...TREASURY_AUDIT_ENTITY_TYPES.map((type) => ({
        value: type,
        label: t(`entityTypes.${type}`),
      })),
    ],
    [t, tCommon],
  );

  const actionOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.all') },
      ...TREASURY_AUDIT_ACTIONS.map((value) => ({
        value,
        label: t(`actions.${value}`),
      })),
    ],
    [t, tCommon],
  );

  const columns = useMemo<ColumnDef<TreasuryAuditLog, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: tColumns('createdAt'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: 'entityType',
        header: tColumns('entityType'),
        cell: ({ row }) => {
          const href = treasuryAuditEntityHref(
            row.original.entityType,
            row.original.entityId,
          );
          const label = t(`entityTypes.${row.original.entityType}`);
          return (
            <div className="min-w-0 space-y-0.5">
              <p className="font-medium text-atg-fg">{label}</p>
              {href ? (
                <a
                  href={href}
                  className="block truncate font-mono text-xs text-atg-info underline-offset-2 hover:underline"
                >
                  {row.original.entityId.slice(0, 8)}…
                </a>
              ) : (
                <p className="font-mono text-xs text-atg-muted">
                  {row.original.entityId.slice(0, 8)}…
                </p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'action',
        header: tColumns('action'),
        cell: ({ row }) => (
          <DataTableBadge variant={actionBadgeVariant(row.original.action)}>
            {t(`actions.${row.original.action}`)}
          </DataTableBadge>
        ),
      },
      {
        accessorKey: 'actorId',
        header: tColumns('actor'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => {
          const { actorType, actorId } = row.original;
          const typeLabel = t(`actorTypes.${actorType}`);
          if (!actorId) {
            return <span className="text-sm text-atg-muted">{typeLabel}</span>;
          }
          return (
            <div className="min-w-0 text-sm">
              <p className="text-atg-fg">{typeLabel}</p>
              <p className="truncate font-mono text-xs text-atg-muted">
                {actorId.slice(0, 8)}…
              </p>
            </div>
          );
        },
      },
      {
        id: 'diff',
        header: tColumns('diff'),
        enableSorting: false,
        cell: ({ row }) => {
          const hasDiff =
            (row.original.oldJson &&
              Object.keys(row.original.oldJson).length > 0) ||
            (row.original.newJson &&
              Object.keys(row.original.newJson).length > 0);
          if (!hasDiff) {
            return <span className="text-sm text-atg-muted">{emptyDash}</span>;
          }
          return (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDetailLog(row.original)}
            >
              {t('showDiff')}
            </Button>
          );
        },
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        enableSorting: false,
        cell: ({ row }) => {
          const href = treasuryAuditEntityHref(
            row.original.entityType,
            row.original.entityId,
          );
          if (!href) return null;
          return (
            <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
              <DataTableActionButton
                action="view"
                label={t('openEntity')}
                href={href}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [t, tColumns, tCommon, formatDateTime, emptyDash],
  );

  if (!canRead && state.status === 'error') {
    return (
      <Card className="p-6">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {tList('accessDenied')}
        </p>
      </Card>
    );
  }

  const logs = state.status === 'ready' ? state.logs : [];
  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const emptyMessage = hasFilters
    ? tList('emptyFiltered')
    : tList('emptyDefault');

  return (
    <div className="space-y-4">
      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={handleClearFilters}
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
                  setEntityType(e.target.value as '' | TreasuryAuditEntityType);
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
                  setAction(e.target.value as '' | TreasuryAuditAction);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-atg-muted">
                {tCommon('filters.dateFrom')}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-atg-muted">
                {tCommon('filters.dateTo')}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
              />
            </div>
          </>
        }
      />

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={logs}
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
              itemLabel={tCommon('pagination.auditEvent')}
              labels={paginationLabels}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      <AuditDiffModal
        log={detailLog}
        open={detailLog != null}
        onOpenChange={(open) => {
          if (!open) setDetailLog(null);
        }}
      />
    </div>
  );
}
