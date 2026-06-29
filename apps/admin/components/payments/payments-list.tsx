'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
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
import type {
  OrganizationListItem,
  PaymentAdminDetail,
  PaymentListItem,
  PaymentStatus,
  RefundPaymentResponse,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { formatMoney } from '../../lib/format-money';
import {
  usePaymentProviderLabels,
  usePaymentStatusLabels,
} from '../../lib/i18n/use-module-labels';
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

type StatusFilter = '' | PaymentStatus;

export function PaymentsList() {
  const { payments: getPaymentsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.payments.list');
  const tCommon = useTranslations('modules.common');
  const tUsers = useTranslations('modules.users.filters');
  const paymentStatusLabels = usePaymentStatusLabels();
  const providerLabels = usePaymentProviderLabels();
  const { toast } = useToast();
  const statusFilterId = useId();
  const orgFilterId = useId();
  const dateFromId = useId();
  const dateToId = useId();
  const emptyDash = tCommon('empty.dash');

  const [page, setPage] = useState(1);
  const [filterTick, setFilterTick] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
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

  const statusFilterOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.all') },
      ...(Object.entries(paymentStatusLabels) as [PaymentStatus, string][]).map(
        ([value, label]) => ({ value, label }),
      ),
    ],
    [paymentStatusLabels, tCommon],
  );

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

  const orgNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const org of organizations) {
      map.set(org.id, org.name);
    }
    return map;
  }, [organizations]);

  const load = useCallback(async () => {
    void filterTick;
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
    filterTick,
    canRead,
    isSuperAdmin,
    t,
    getPaymentsErrorMessage,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

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
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">
            {formatPaymentDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'client',
        header: tCommon('columns.client'),
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-atg-fg">{row.original.clientEmail}</span>
            <p className="text-xs text-atg-muted">
              {row.original.clientFirstName} {row.original.clientLastName}
            </p>
          </div>
        ),
      },
      {
        id: 'booking',
        header: tCommon('columns.booking'),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-atg-muted">
            {row.original.bookingId.slice(0, 8)}…
          </span>
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
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {formatPaymentProvider(row.original.provider, providerLabels, emptyDash)}
          </span>
        ),
      },
      {
        id: 'organization',
        header: tCommon('columns.organization'),
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
            <DataTableActionButton action="view" onClick={() => openDetail(row.original.id)} />
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
      tCommon,
    ],
  );

  const applyFilters = useCallback(() => {
    setPage(1);
    setFilterTick((tick) => tick + 1);
  }, []);

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const payments = state.status === 'ready' ? state.payments : [];
  const hasFilters =
    statusFilter !== '' ||
    organizationFilter !== '' ||
    dateFrom !== '' ||
    dateTo !== '';
  const emptyMessage = hasFilters ? t('emptyFiltered') : t('emptyDefault');

  const showRefundAction = canRefund && detail !== null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <label htmlFor={statusFilterId} className="mb-2 block text-sm font-medium text-atg-fg">
              {tCommon('columns.status')}
            </label>
            <select
              id={statusFilterId}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full min-w-[180px] rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {statusFilterOptions.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {isSuperAdmin ? (
            <div>
              <label htmlFor={orgFilterId} className="mb-2 block text-sm font-medium text-atg-fg">
                {tUsers('organization')}
              </label>
              <select
                id={orgFilterId}
                value={organizationFilter}
                onChange={(e) => setOrganizationFilter(e.target.value)}
                className="w-full min-w-[180px] rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">{tCommon('filters.allFeminine')}</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label htmlFor={dateFromId} className="mb-2 block text-sm font-medium text-atg-fg">
              {tCommon('filters.dateFrom')}
            </label>
            <Input
              id={dateFromId}
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={dateToId} className="mb-2 block text-sm font-medium text-atg-fg">
              {tCommon('filters.dateTo')}
            </label>
            <Input
              id={dateToId}
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {tCommon('filters.apply')}
          </button>
        </div>
      </div>

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
              emptyMessage={emptyMessage}
              emptyVariant={hasFilters ? 'search' : 'default'}
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
