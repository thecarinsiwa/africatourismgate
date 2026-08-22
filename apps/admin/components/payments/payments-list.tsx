'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
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
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  OrganizationListItem,
  PaymentAdminDetail,
  PaymentListItem,
  PaymentStatus,
  RefundPaymentResponse,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { exportCsv } from '../../lib/export-csv';
import { formatMoney } from '../../lib/format-money';
import {
  usePaymentProviderLabels,
  usePaymentStatusLabels,
} from '../../lib/i18n/use-module-labels';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import {
  formatPaymentDateTime,
  formatPaymentProvider,
  paymentStatusVariants,
} from '../../lib/payment-display';
import { PaymentDetailDrawer } from './payment-detail-drawer';
import {
  PaymentRefundModal,
  type PaymentRefundConfirmParams,
} from './payment-refund-modal';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type StatusFilter = '' | PaymentStatus;

export type PaymentsStatusFilter = StatusFilter;

function formatBookingRef(bookingId: string): string {
  return `${bookingId.slice(0, 8)}…`;
}

type PaymentsListProps = {
  statusFilter: PaymentsStatusFilter;
  onStatusFilterChange: (filter: PaymentsStatusFilter) => void;
};

export function PaymentsList({ statusFilter, onStatusFilterChange }: PaymentsListProps) {
  const { payments: getPaymentsErrorMessage } = useAdminErrorMessages();
  const locale = useLocale();
  const t = useTranslations('modules.payments.list');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tActions = useTranslations('common.actions');
  const tExport = useTranslations('modules.common.exportCsv');
  const tUsers = useTranslations('modules.users.filters');
  const paymentStatusLabels = usePaymentStatusLabels();
  const providerLabels = usePaymentProviderLabels();
  const paginationLabels = useDataTablePaginationLabels();
  const { toast } = useToast();
  const emptyDash = tCommon('empty.dash');

  const [page, setPage] = useState(1);
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [canRead, setCanRead] = useState(true);
  const [canRefund, setCanRefund] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PaymentAdminDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundHistory, setRefundHistory] = useState<RefundPaymentResponse[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; payments: PaymentListItem[]; total: number; totalPages: number }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (cancelled) return;
        setIsSuperAdmin(me.isSuperAdmin);
        setCanRead(me.isSuperAdmin || me.permissions.includes('payments.read'));
        setCanRefund(
          me.isSuperAdmin ||
            me.permissions.includes('payments.write') ||
            me.permissions.includes('payments.refund'),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setCanRead(false);
          setCanRefund(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    async function loadOrgs() {
      try {
        const result = await getApiClient().listOrganizations({ page: 1, limit: 100 });
        if (!cancelled) setOrganizations(result.data);
      } catch {
        if (!cancelled) setOrganizations([]);
      }
    }
    void loadOrgs();
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

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

  const orgNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const org of organizations) {
      map.set(org.id, org.name);
    }
    return map;
  }, [organizations]);

  const organizationOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.allFeminine') },
      ...organizations.map((org) => ({ value: org.id, label: org.name })),
    ],
    [organizations, tCommon],
  );

  const statusTabs = useMemo(
    () => [
      { value: '' as StatusFilter, label: t('tabs.all') },
      { value: 'pending' as StatusFilter, label: t('tabs.pending') },
      { value: 'succeeded' as StatusFilter, label: t('tabs.succeeded') },
      { value: 'failed' as StatusFilter, label: t('tabs.failed') },
      { value: 'refunded' as StatusFilter, label: t('tabs.refunded') },
    ],
    [t],
  );

  const load = useCallback(async () => {
    if (!canRead) {
      setState({
        status: 'error',
        message: t('accessDenied'),
      });
      return;
    }
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listPayments({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        organizationId: isSuperAdmin && organizationFilter ? organizationFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        payments: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getPaymentsErrorMessage(error) });
    }
  }, [
    page,
    statusFilter,
    organizationFilter,
    dateFrom,
    dateTo,
    search,
    canRead,
    isSuperAdmin,
    t,
    getPaymentsErrorMessage,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const activeFilterCount = [
    search !== '',
    statusFilter !== '',
    organizationFilter !== '',
    dateFrom !== '',
    dateTo !== '',
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    onStatusFilterChange('');
    setOrganizationFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }, [onStatusFilterChange]);

  const loadDetail = useCallback(
    async (id: string) => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const data = await getApiClient().getPayment(id);
        setDetail(data);
      } catch (error) {
        setDetail(null);
        setDetailError(getPaymentsErrorMessage(error));
      } finally {
        setDetailLoading(false);
      }
    },
    [getPaymentsErrorMessage],
  );

  const openDetail = useCallback(
    (id: string) => {
      setSelectedId(id);
      setRefundOpen(false);
      setRefundHistory([]);
      void loadDetail(id);
    },
    [loadDetail],
  );

  const closeDetail = useCallback(() => {
    setSelectedId(null);
    setDetail(null);
    setDetailError(null);
    setRefundOpen(false);
    setRefundHistory([]);
  }, []);

  const handleRefundConfirm = useCallback(
    async ({ amountCents }: PaymentRefundConfirmParams) => {
      if (!selectedId || !detail) {
        throw new Error(t('notFoundError'));
      }

      const response = await getApiClient().refundPayment(selectedId, { amountCents });
      setRefundHistory((prev) => [...prev, response]);
      await loadDetail(selectedId);
      await load();

      toast({
        variant: 'success',
        title: t('toast.refundSuccessTitle'),
        message: t('toast.refundSuccessMessage', {
          amount: formatMoney(response.amountCents, detail.currency),
        }),
      });
    },
    [selectedId, detail, loadDetail, load, toast, t],
  );

  const columns = useMemo<ColumnDef<PaymentListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: tCommon('columns.date'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums">
            {formatPaymentDateTime(row.original.createdAt, locale)}
          </span>
        ),
      },
      {
        id: 'client',
        header: tCommon('columns.client'),
        cell: ({ row }) => (
          <div className="min-w-0">
            <span className="block truncate font-medium text-atg-fg">
              {row.original.clientEmail}
            </span>
            <p className="truncate text-xs text-atg-muted">
              {row.original.clientFirstName} {row.original.clientLastName}
            </p>
          </div>
        ),
      },
      {
        id: 'booking',
        header: tCommon('columns.booking'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <Link
            href={`/reservations/${row.original.bookingId}`}
            className="font-mono text-xs text-primary hover:underline"
          >
            {formatBookingRef(row.original.bookingId)}
          </Link>
        ),
      },
      {
        accessorKey: 'status',
        header: tCommon('columns.status'),
        meta: { align: 'center' },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <DataTableBadge variant={paymentStatusVariants[status]}>
              {paymentStatusLabels[status]}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'amount',
        header: tCommon('columns.amount'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-medium">
            {formatMoney(row.original.amountCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'method',
        header: tCommon('columns.method'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {formatPaymentProvider(row.original.provider, providerLabels, emptyDash)}
          </span>
        ),
      },
      {
        id: 'organization',
        header: tCommon('columns.organization'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => {
          const orgId = row.original.organizationId;
          if (!orgId) return <span className="text-atg-muted">{emptyDash}</span>;
          return (
            <span className="text-sm text-atg-muted">
              {orgNameById.get(orgId) ?? orgId.slice(0, 8)}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="view"
              label={tActions('view')}
              onClick={() => openDetail(row.original.id)}
            />
          </DataTableActions>
        ),
      },
    ],
    [
      emptyDash,
      openDetail,
      orgNameById,
      paymentStatusLabels,
      providerLabels,
      tActions,
      tCommon,
      locale,
    ],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const payments = state.status === 'ready' ? state.payments : [];
  const emptyMessage = hasFilters ? t('emptyFiltered') : t('emptyDefault');

  const handleExportCsv = useCallback(() => {
    if (payments.length === 0) return;
    const date = new Date().toISOString().slice(0, 10);
    exportCsv({
      filename: `paiements-${date}.csv`,
      columns: [
        {
          header: tCommon('columns.date'),
          value: (row) => formatPaymentDateTime(row.createdAt, locale),
        },
        { header: tCommon('columns.client'), value: (row) => row.clientEmail },
        {
          header: tCommon('columns.booking'),
          value: (row) => row.bookingId,
        },
        {
          header: tCommon('columns.status'),
          value: (row) => paymentStatusLabels[row.status],
        },
        {
          header: tCommon('columns.amount'),
          value: (row) => formatMoney(row.amountCents, row.currency),
        },
        {
          header: tCommon('columns.method'),
          value: (row) => formatPaymentProvider(row.provider, providerLabels, emptyDash),
        },
        {
          header: tCommon('columns.organization'),
          value: (row) =>
            row.organizationId
              ? (orgNameById.get(row.organizationId) ?? row.organizationId)
              : emptyDash,
        },
      ],
      rows: payments,
    });
    toast({ variant: 'success', message: tExport('success') });
  }, [emptyDash, locale, orgNameById, paymentStatusLabels, payments, providerLabels, tCommon, tExport, toast]);

  const showRefundAction = canRefund && detail !== null;

  return (
    <div className="space-y-6">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label={t('tabs.ariaLabel')}
      >
        {statusTabs.map((tab) => (
          <Button
            key={tab.value || 'all'}
            type="button"
            size="sm"
            variant={statusFilter === tab.value ? 'primary' : 'outline'}
            role="tab"
            aria-selected={statusFilter === tab.value}
            onClick={() => {
              onStatusFilterChange(tab.value);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={handleClearFilters}
        clearLabel={tCommon('filters.clearAll')}
        applyLabel={tCommon('filters.apply')}
        toggleLabel={tCommon('filters.toggle')}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading || payments.length === 0}
            onClick={handleExportCsv}
          >
            {tExport('button')}
          </Button>
        }
        filters={
          <>
            <div className="min-w-[200px] flex-1 sm:max-w-md">
              <Input
                name="search"
                type="search"
                placeholder={t('filters.search')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={t('filters.searchAria')}
              />
            </div>
            {isSuperAdmin ? (
              <div className="w-full sm:w-48">
                <Select
                  label={tUsers('organization')}
                  value={organizationFilter}
                  options={organizationOptions}
                  onChange={(e) => {
                    setOrganizationFilter(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            ) : null}
            <div className="w-full sm:w-40">
              <Input
                label={tCommon('filters.dateFrom')}
                name="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-40">
              <Input
                label={tCommon('filters.dateTo')}
                name="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
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
              data={payments}
              isLoading={isLoading}
              loadingMessage={tDataTable('loading')}
              emptyMessage={emptyMessage}
              emptyVariant={hasFilters ? 'search' : 'default'}
              expandRowLabel={tDataTable('expandRow')}
              collapseRowLabel={tDataTable('collapseRow')}
              expandRowAriaLabel={tDataTable('expandRowAria')}
              getRowId={(row) => row.id}
              aria-label={t('ariaLabel')}
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tCommon('pagination.payment')}
              labels={paginationLabels}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      <PaymentDetailDrawer
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) closeDetail();
        }}
        detail={detail}
        loading={detailLoading}
        error={detailError}
        refundHistory={refundHistory}
        canRefund={showRefundAction}
        onRefundClick={() => setRefundOpen(true)}
      />

      {detail ? (
        <PaymentRefundModal
          open={refundOpen}
          onOpenChange={setRefundOpen}
          detail={detail}
          refundHistory={refundHistory}
          onConfirm={handleRefundConfirm}
        />
      ) : null}
    </div>
  );
}
