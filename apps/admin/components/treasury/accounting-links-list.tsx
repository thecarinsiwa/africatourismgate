'use client';

import {
  Card,
  DataTable,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Select,
  type ColumnDef,
  type DataTableBadgeVariant,
} from '@africatourismgate/ui';
import type {
  AccountingFundOpType,
  AccountingLink,
  AccountingLinkStatus,
} from '@africatourismgate/types';
import {
  ACCOUNTING_FUND_OP_TYPES,
  ACCOUNTING_LINK_STATUSES,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { useFormatDateTime } from '../../lib/i18n/use-module-labels';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';

const PAGE_SIZE = 20;

const STATUS_BADGE: Record<AccountingLinkStatus, DataTableBadgeVariant> = {
  pending: 'warning',
  linked: 'success',
  skipped: 'muted',
};

function fundOpHref(type: AccountingFundOpType, id: string): string {
  return type === 'fund_entry'
    ? `/tresorerie/entrees/${id}/voir`
    : `/tresorerie/sorties/${id}/voir`;
}

export function AccountingLinksList() {
  const t = useTranslations('modules.treasury.accounting');
  const tList = useTranslations('modules.treasury.accounting.list');
  const tColumns = useTranslations('modules.treasury.accounting.list.columns');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const formatDateTime = useFormatDateTime('mediumTime');
  const paginationLabels = useDataTablePaginationLabels();
  const emptyDash = tCommon('empty.dash');

  const [page, setPage] = useState(1);
  const [fundOpType, setFundOpType] = useState<'' | AccountingFundOpType>('');
  const [status, setStatus] = useState<'' | AccountingLinkStatus>('');
  const [canRead, setCanRead] = useState(true);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        links: AccountingLink[];
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
          me.isSuperAdmin ||
            me.permissions.includes('treasury.accounting_link.read'),
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
      setState({ status: 'error', message: tList('accessDenied') });
      return;
    }
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listAccountingLinks({
        page,
        limit: PAGE_SIZE,
        fundOpType: fundOpType || undefined,
        status: status || undefined,
      });
      setState({
        status: 'ready',
        links: result.data,
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
  }, [canRead, page, fundOpType, status, tList, commonErrorMessages]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeFilterCount = [fundOpType !== '', status !== ''].filter(
    Boolean,
  ).length;
  const hasFilters = activeFilterCount > 0;

  const handleClearFilters = useCallback(() => {
    setFundOpType('');
    setStatus('');
    setPage(1);
  }, []);

  const fundOpTypeOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.all') },
      ...ACCOUNTING_FUND_OP_TYPES.map((type) => ({
        value: type,
        label: t(`fundOpTypes.${type}`),
      })),
    ],
    [t, tCommon],
  );

  const statusOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.all') },
      ...ACCOUNTING_LINK_STATUSES.map((value) => ({
        value,
        label: t(`statuses.${value}`),
      })),
    ],
    [t, tCommon],
  );

  const columns = useMemo<ColumnDef<AccountingLink, unknown>[]>(
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
        accessorKey: 'fundOpType',
        header: tColumns('fundOpType'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-fg">
            {t(`fundOpTypes.${row.original.fundOpType}`)}
          </span>
        ),
      },
      {
        accessorKey: 'fundOpId',
        header: tColumns('fundOp'),
        cell: ({ row }) => {
          const href = fundOpHref(
            row.original.fundOpType,
            row.original.fundOpId,
          );
          return (
            <Link
              href={href}
              className="font-mono text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {row.original.fundOpId.slice(0, 8)}…
            </Link>
          );
        },
      },
      {
        accessorKey: 'status',
        header: tColumns('status'),
        cell: ({ row }) => (
          <DataTableBadge
            variant={STATUS_BADGE[row.original.status] ?? 'muted'}
          >
            {t(`statuses.${row.original.status}`)}
          </DataTableBadge>
        ),
      },
      {
        accessorKey: 'mappingRuleKey',
        header: tColumns('mappingRuleKey'),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-atg-muted">
            {row.original.mappingRuleKey ?? emptyDash}
          </span>
        ),
      },
      {
        accessorKey: 'journalEntryId',
        header: tColumns('journalEntryId'),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-atg-muted">
            {row.original.journalEntryId
              ? `${row.original.journalEntryId.slice(0, 8)}…`
              : emptyDash}
          </span>
        ),
      },
    ],
    [emptyDash, formatDateTime, t, tColumns],
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

  const links = state.status === 'ready' ? state.links : [];
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
                label={t('filters.fundOpType')}
                value={fundOpType}
                options={fundOpTypeOptions}
                onChange={(e) => {
                  setFundOpType(e.target.value as '' | AccountingFundOpType);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-52">
              <Select
                label={t('filters.status')}
                value={status}
                options={statusOptions}
                onChange={(e) => {
                  setStatus(e.target.value as '' | AccountingLinkStatus);
                  setPage(1);
                }}
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
              data={links}
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
              itemLabel={t('pagination.item')}
              labels={paginationLabels}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
