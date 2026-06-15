'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  Organization,
  PaymentAdminDetail,
  PaymentListItem,
  PaymentStatus,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { formatMoney } from '../../lib/format-money';
import { getPaymentsErrorMessage } from '../../lib/payments-errors';

const PAGE_SIZE = 20;
const STRIPE_PROVIDER = 'stripe';

type StatusFilter = '' | PaymentStatus;

const statusLabels: Record<PaymentStatus, string> = {
  pending: 'En attente',
  succeeded: 'Réussi',
  failed: 'Échoué',
  refunded: 'Remboursé',
};

const statusVariants: Record<
  PaymentStatus,
  'success' | 'warning' | 'muted' | 'danger' | 'default'
> = {
  pending: 'warning',
  succeeded: 'success',
  failed: 'danger',
  refunded: 'default',
};

const providerLabels: Record<string, string> = {
  stripe: 'Stripe',
  cash: 'Espèces',
};

function formatProvider(provider: string | null): string {
  if (!provider) return '—';
  return providerLabels[provider] ?? provider;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function canRefundPayment(detail: PaymentAdminDetail): boolean {
  return (
    detail.status === 'succeeded' &&
    detail.provider === STRIPE_PROVIDER &&
    detail.bookingStatus === 'cancelled'
  );
}

export function PaymentsList() {
  const statusFilterId = useId();
  const orgFilterId = useId();
  const dateFromId = useId();
  const dateToId = useId();
  const partialAmountId = useId();

  const [page, setPage] = useState(1);
  const [filterTick, setFilterTick] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [canRead, setCanRead] = useState(true);
  const [canRefund, setCanRefund] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PaymentAdminDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
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
        message: 'Accès refusé : permission payments.read requise.',
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
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadDetail = useCallback(async (id: string) => {
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
  }, []);

  const openDetail = useCallback(
    (id: string) => {
      setSelectedId(id);
      setRefundOpen(false);
      setRefundError(null);
      setPartialAmount('');
      void loadDetail(id);
    },
    [loadDetail],
  );

  const closeDetail = useCallback(() => {
    setSelectedId(null);
    setDetail(null);
    setDetailError(null);
    setRefundOpen(false);
    setRefundError(null);
    setPartialAmount('');
  }, []);

  const handleRefund = useCallback(async () => {
    if (!selectedId || !detail) return;
    setRefundError(null);
    setRefundLoading(true);
    try {
      const trimmed = partialAmount.trim();
      const amountCents = trimmed ? Math.round(parseFloat(trimmed) * 100) : undefined;
      if (amountCents !== undefined && (Number.isNaN(amountCents) || amountCents < 1)) {
        setRefundError('Montant partiel invalide.');
        return;
      }
      await getApiClient().refundPayment(selectedId, { amountCents });
      setRefundOpen(false);
      setPartialAmount('');
      await loadDetail(selectedId);
      await load();
    } catch (error) {
      setRefundError(getPaymentsErrorMessage(error));
    } finally {
      setRefundLoading(false);
    }
  }, [selectedId, detail, partialAmount, loadDetail, load]);

  const columns = useMemo<ColumnDef<PaymentListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'client',
        header: 'Client',
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
        header: 'Réservation',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-atg-muted">
            {row.original.bookingId.slice(0, 8)}…
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Statut',
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
        id: 'amount',
        header: 'Montant',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-medium">
            {formatMoney(row.original.amountCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'method',
        header: 'Méthode',
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {formatProvider(row.original.provider)}
          </span>
        ),
      },
      {
        id: 'organization',
        header: 'Organisation',
        cell: ({ row }) => {
          const orgId = row.original.organizationId;
          if (!orgId) return <span className="text-atg-muted">—</span>;
          return (
            <span className="text-sm text-atg-muted">
              {orgNameById.get(orgId) ?? orgId.slice(0, 8)}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton action="view" onClick={() => openDetail(row.original.id)} />
          </DataTableActions>
        ),
      },
    ],
    [openDetail, orgNameById],
  );

  const applyFilters = useCallback(() => {
    setPage(1);
    setFilterTick((t) => t + 1);
  }, []);

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const payments = state.status === 'ready' ? state.payments : [];
  const hasFilters =
    statusFilter !== '' ||
    organizationFilter !== '' ||
    dateFrom !== '' ||
    dateTo !== '';
  const emptyMessage = hasFilters
    ? 'Aucun paiement ne correspond à vos critères.'
    : 'Aucun paiement pour le moment.';

  const showRefundAction =
    canRefund && detail !== null && canRefundPayment(detail);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <label htmlFor={statusFilterId} className="mb-2 block text-sm font-medium text-atg-fg">
              Statut
            </label>
            <select
              id={statusFilterId}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full min-w-[180px] rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Tous</option>
              {(Object.keys(statusLabels) as PaymentStatus[]).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
          {isSuperAdmin ? (
            <div>
              <label htmlFor={orgFilterId} className="mb-2 block text-sm font-medium text-atg-fg">
                Organisation
              </label>
              <select
                id={orgFilterId}
                value={organizationFilter}
                onChange={(e) => setOrganizationFilter(e.target.value)}
                className="w-full min-w-[180px] rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">Toutes</option>
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
              Du
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
              Au
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
            Appliquer
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
              aria-label="Liste des paiements"
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="paiement"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      {selectedId ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            aria-label="Fermer le détail"
            onClick={closeDetail}
          />
          <aside
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-atg-border bg-atg-surface shadow-xl"
            role="dialog"
            aria-labelledby="payment-detail-title"
          >
            <div className="flex items-center justify-between border-b border-atg-border px-6 py-4">
              <h2 id="payment-detail-title" className="text-lg font-semibold text-atg-fg">
                Détail du paiement
              </h2>
              <button
                type="button"
                onClick={closeDetail}
                className="rounded-lg px-3 py-1 text-sm text-atg-muted hover:bg-atg-elevated"
              >
                Fermer
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {detailLoading ? (
                <p className="text-sm text-atg-muted">Chargement…</p>
              ) : detailError ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {detailError}
                </p>
              ) : detail ? (
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-atg-muted">Montant</dt>
                    <dd className="tabular-nums text-base font-semibold text-atg-fg">
                      {formatMoney(detail.amountCents, detail.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-atg-muted">Statut</dt>
                    <dd>
                      <DataTableBadge variant={statusVariants[detail.status]}>
                        {statusLabels[detail.status]}
                      </DataTableBadge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-atg-muted">Méthode</dt>
                    <dd className="text-atg-fg">{formatProvider(detail.provider)}</dd>
                  </div>
                  <div>
                    <dt className="text-atg-muted">Date</dt>
                    <dd className="text-atg-fg">{formatDateTime(detail.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-atg-muted">Client</dt>
                    <dd className="text-atg-fg">
                      {detail.clientEmail}
                      <br />
                      <span className="text-atg-muted">
                        {detail.clientFirstName} {detail.clientLastName}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-atg-muted">Réservation</dt>
                    <dd>
                      <Link
                        href={`/dashboard/bookings/${detail.bookingId}`}
                        className="font-medium text-primary hover:underline"
                      >
                        Voir la réservation
                      </Link>
                      <p className="mt-1 text-xs text-atg-muted font-mono">
                        {detail.bookingId}
                      </p>
                    </dd>
                  </div>
                  {detail.externalId ? (
                    <div>
                      <dt className="text-atg-muted">Réf. externe</dt>
                      <dd className="break-all font-mono text-xs text-atg-fg">
                        {detail.externalId}
                      </dd>
                    </div>
                  ) : null}
                  {detail.status === 'succeeded' &&
                  detail.provider === STRIPE_PROVIDER &&
                  detail.bookingStatus !== 'cancelled' ? (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
                      Remboursement Stripe : annulez d’abord la réservation.
                    </p>
                  ) : null}
                </dl>
              ) : null}
            </div>
            {detail && !detailLoading && !detailError ? (
              <div className="flex flex-wrap gap-2 border-t border-atg-border px-6 py-4">
                {showRefundAction ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setRefundOpen(true);
                      setRefundError(null);
                    }}
                  >
                    Rembourser
                  </Button>
                ) : null}
              </div>
            ) : null}
          </aside>

          {refundOpen && detail ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-[60] bg-black/50"
                aria-label="Fermer"
                onClick={() => setRefundOpen(false)}
              />
              <div
                className="fixed left-1/2 top-1/2 z-[70] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-atg-border bg-atg-surface p-6 shadow-xl"
                role="alertdialog"
                aria-labelledby="refund-dialog-title"
              >
                <h3 id="refund-dialog-title" className="text-lg font-semibold text-atg-fg">
                  Confirmer le remboursement
                </h3>
                <p className="mt-2 text-sm text-atg-muted">
                  Remboursement Stripe pour{' '}
                  <strong className="tabular-nums text-atg-fg">
                    {formatMoney(detail.amountCents, detail.currency)}
                  </strong>
                  . Laissez le montant vide pour un remboursement total.
                </p>
                <div className="mt-4">
                  <label
                    htmlFor={partialAmountId}
                    className="mb-2 block text-sm font-medium text-atg-fg"
                  >
                    Montant partiel ({detail.currency}, optionnel)
                  </label>
                  <Input
                    id={partialAmountId}
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Ex. 10.00"
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                  />
                </div>
                {refundError ? (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
                    {refundError}
                  </p>
                ) : null}
                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRefundOpen(false)}
                    disabled={refundLoading}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => void handleRefund()}
                    disabled={refundLoading}
                  >
                    {refundLoading ? 'Remboursement…' : 'Confirmer'}
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
