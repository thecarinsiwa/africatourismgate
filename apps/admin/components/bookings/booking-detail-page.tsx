'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableBadge,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  BookingAdminDetail,
  BookingItem,
  BookingPayment,
  BookingStatus,
  BookingStatusHistoryEntry,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getItemTypeLabel } from '../../lib/booking-item-labels';
import { getBookingsErrorMessage } from '../../lib/bookings-errors';

const statusLabels: Record<BookingStatus, string> = {
  draft: 'Brouillon',
  pending_payment: 'En attente de paiement',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

const statusVariants: Record<
  BookingStatus,
  'success' | 'warning' | 'muted' | 'danger' | 'default'
> = {
  draft: 'muted',
  pending_payment: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  refunded: 'default',
};

const paymentStatusLabels: Record<BookingPayment['status'], string> = {
  pending: 'En attente',
  succeeded: 'Réussi',
  failed: 'Échoué',
  refunded: 'Remboursé',
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch {
    return iso;
  }
}

function formatMoney(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

type BookingDetailPageProps = {
  bookingId: string;
};

export function BookingDetailPage({ bookingId }: BookingDetailPageProps) {
  const statusSelectId = useId();
  const statusReasonId = useId();
  const cancelReasonId = useId();

  const [canWrite, setCanWrite] = useState(false);
  const [detail, setDetail] = useState<BookingAdminDetail | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newStatus, setNewStatus] = useState<BookingStatus>('confirmed');
  const [statusReason, setStatusReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await getApiClient().getBooking(bookingId);
      setDetail(data);
      setNewStatus(
        data.booking.status === 'pending_payment' ? 'confirmed' : data.booking.status,
      );
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getBookingsErrorMessage(error) });
    }
  }, [bookingId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setCanWrite(me.isSuperAdmin || me.permissions.includes('bookings.write'));
        }
      })
      .catch(() => {
        if (!cancelled) setCanWrite(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdateStatus = useCallback(async () => {
    if (!detail) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await getApiClient().updateBookingStatus(bookingId, {
        status: newStatus,
        reason: statusReason.trim() || undefined,
      });
      setStatusReason('');
      await load();
    } catch (error) {
      setActionError(getBookingsErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  }, [bookingId, detail, load, newStatus, statusReason]);

  const handleCancel = useCallback(async () => {
    if (!detail) return;
    if (
      !window.confirm(
        'Annuler cette réservation ? Le stock des produits sera libéré (moteur de réservation).',
      )
    ) {
      return;
    }
    setActionError(null);
    setActionLoading(true);
    try {
      await getApiClient().cancelBooking(bookingId, {
        reason: cancelReason.trim() || undefined,
      });
      setCancelReason('');
      await load();
    } catch (error) {
      setActionError(getBookingsErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  }, [bookingId, cancelReason, detail, load]);

  const itemColumns = useMemo<ColumnDef<BookingItem, unknown>[]>(
    () => [
      {
        accessorKey: 'itemType',
        header: 'Type',
        cell: ({ row }) => getItemTypeLabel(row.original.itemType),
      },
      { accessorKey: 'titleSnapshot', header: 'Libellé' },
      {
        accessorKey: 'quantity',
        header: 'Qté',
        meta: { align: 'center' },
      },
      {
        id: 'unitPrice',
        header: 'Prix unit.',
        meta: { align: 'right' },
        cell: ({ row }) =>
          detail
            ? formatMoney(row.original.unitPriceCents, detail.currency)
            : row.original.unitPriceCents,
      },
      {
        id: 'dates',
        header: 'Dates',
        cell: ({ row }) => {
          const { startDate, endDate } = row.original;
          if (!startDate) return '—';
          if (startDate === endDate || !endDate) return startDate;
          return `${startDate} → ${endDate}`;
        },
      },
    ],
    [detail],
  );

  const paymentColumns = useMemo<ColumnDef<BookingPayment, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        id: 'amount',
        header: 'Montant',
        meta: { align: 'right' },
        cell: ({ row }) => formatMoney(row.original.amountCents, row.original.currency),
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        meta: { align: 'center' },
        cell: ({ row }) => paymentStatusLabels[row.original.status],
      },
      {
        accessorKey: 'provider',
        header: 'Fournisseur',
        cell: ({ row }) => row.original.provider ?? '—',
      },
    ],
    [],
  );

  const historyColumns = useMemo<ColumnDef<BookingStatusHistoryEntry, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        id: 'transition',
        header: 'Transition',
        cell: ({ row }) => {
          const from = row.original.fromStatus
            ? statusLabels[row.original.fromStatus]
            : '—';
          const to = statusLabels[row.original.toStatus];
          return (
            <span className="text-sm">
              {from} → <span className="font-medium">{to}</span>
            </span>
          );
        },
      },
      {
        accessorKey: 'reason',
        header: 'Motif',
        cell: ({ row }) => row.original.reason ?? '—',
      },
    ],
    [],
  );

  if (state.status === 'loading' && !detail) {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
        <Link href="/reservations" className="text-sm font-medium text-primary">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  if (!detail) {
    return null;
  }

  const { booking, client } = detail;
  const canCancel =
    booking.status === 'pending_payment' || booking.status === 'confirmed';

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/reservations" className="text-sm font-medium text-primary">
            ← Réservations
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-atg-fg">Réservation</h1>
          <p className="mt-1 font-mono text-sm text-atg-muted">{booking.id}</p>
        </div>
        <DataTableBadge variant={statusVariants[booking.status]}>
          {statusLabels[booking.status]}
        </DataTableBadge>
      </div>

      {actionError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {actionError}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="dashboard" padding="md">
          <h2 className="text-lg font-semibold text-atg-fg">Client</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-atg-muted">E-mail</dt>
              <dd className="font-medium text-atg-fg">{client.email}</dd>
            </div>
            <div>
              <dt className="text-atg-muted">Nom</dt>
              <dd>
                {client.firstName} {client.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-atg-muted">Organisation</dt>
              <dd>{client.organizationName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-atg-muted">Total</dt>
              <dd className="tabular-nums font-medium">
                {formatMoney(detail.totalCents, detail.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-atg-muted">Créée le</dt>
              <dd>{formatDateTime(booking.createdAt)}</dd>
            </div>
          </dl>
        </Card>

        {canWrite ? (
          <Card variant="dashboard" padding="md" className="space-y-6">
            <h2 className="text-lg font-semibold text-atg-fg">Actions</h2>
            <div className="space-y-3">
              <label htmlFor={statusSelectId} className="block text-sm font-medium text-atg-fg">
                Changer le statut
              </label>
              <select
                id={statusSelectId}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as BookingStatus)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg"
              >
                {(Object.keys(statusLabels) as BookingStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
              <label htmlFor={statusReasonId} className="block text-sm font-medium text-atg-fg">
                Motif (historique)
              </label>
              <textarea
                id={statusReasonId}
                rows={2}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg"
                placeholder="Ex. confirmation manuelle, remboursement…"
              />
              <Button
                type="button"
                onClick={() => void handleUpdateStatus()}
                disabled={actionLoading}
                loading={actionLoading}
              >
                Appliquer le statut
              </Button>
            </div>

            {canCancel ? (
              <div className="space-y-3 border-t border-atg-border pt-6">
                <h3 className="text-sm font-semibold text-atg-fg">Annulation (moteur #27)</h3>
                <label htmlFor={cancelReasonId} className="block text-sm font-medium text-atg-fg">
                  Motif d&apos;annulation
                </label>
                <textarea
                  id={cancelReasonId}
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg"
                  placeholder="Ex. demande client, indisponibilité…"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="!text-red-600 hover:!bg-red-50 dark:!text-red-400"
                  onClick={() => void handleCancel()}
                  disabled={actionLoading}
                  loading={actionLoading}
                >
                  Annuler la réservation
                </Button>
              </div>
            ) : null}
          </Card>
        ) : (
          <Card variant="dashboard" padding="md">
            <p className="text-sm text-atg-muted">
              Modification réservée aux comptes avec la permission bookings.write.
            </p>
          </Card>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-atg-fg">Lignes de réservation</h2>
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={itemColumns}
            data={detail.items}
            emptyMessage="Aucune ligne."
            getRowId={(row) => row.id}
            aria-label="Lignes de réservation"
          />
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-atg-fg">Paiements</h2>
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={paymentColumns}
            data={detail.payments}
            emptyMessage="Aucun paiement enregistré pour cette réservation."
            getRowId={(row) => row.id}
            aria-label="Paiements"
          />
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-atg-fg">Historique des statuts</h2>
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={historyColumns}
            data={detail.statusHistory}
            emptyMessage="Aucun historique."
            getRowId={(row) => row.id}
            aria-label="Historique des statuts"
          />
        </Card>
      </section>
    </div>
  );
}
