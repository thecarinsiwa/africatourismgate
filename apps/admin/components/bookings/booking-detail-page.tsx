'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableBadge,
  Select,
  Skeleton,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  BookingAdminDetail,
  BookingItem,
  BookingPayment,
  BookingStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AdminPageBackLink } from '../admin-page-back-link';
import { getApiClient } from '../../lib/auth/api';
import {
  BOOKING_STATUSES,
  BOOKING_STATUS_VARIANTS,
  getBookingStatusLabel,
} from '../../lib/booking-status';
import { formatMoney } from '../../lib/format-money';
import {
  useBookingStatusLabels,
  usePaymentProviderLabels,
  usePaymentStatusLabels,
} from '../../lib/i18n/use-module-labels';
import { formatPaymentProvider } from '../../lib/payment-display';
import { BookingItemCatalogLink } from './booking-item-catalog-link';
import { BookingItemTypeIcon } from './booking-item-type-icon';
import { BookingStatusTimeline } from './booking-status-timeline';

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

function formatBookingRef(id: string): string {
  return id.slice(0, 8);
}

type BookingDetailPageProps = {
  bookingId: string;
};

function BookingDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.6fr)]">
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function BookingDetailPage({ bookingId }: BookingDetailPageProps) {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.detail');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const statusLabels = useBookingStatusLabels();
  const paymentStatusLabels = usePaymentStatusLabels();
  const providerLabels = usePaymentProviderLabels();
  const emptyDash = tCommon('empty.dash');

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
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useAdminEditPageMeta({
    ready: state.status === 'ready' && detail != null,
    title: t('title'),
    entityLabel: detail?.booking.id,
  });

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
  }, [bookingId, getBookingsErrorMessage]);

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
    if (!detail) return false;
    setActionError(null);
    setActionLoading(true);
    try {
      await getApiClient().updateBookingStatus(bookingId, {
        status: newStatus,
        reason: statusReason.trim() || undefined,
      });
      setStatusReason('');
      await load();
      return true;
    } catch (error) {
      setActionError(getBookingsErrorMessage(error));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [bookingId, detail, load, newStatus, statusReason, getBookingsErrorMessage]);

  const handleCancel = useCallback(async () => {
    if (!detail) return false;
    setActionError(null);
    setActionLoading(true);
    try {
      await getApiClient().cancelBooking(bookingId, {
        reason: cancelReason.trim() || undefined,
      });
      setCancelReason('');
      await load();
      return true;
    } catch (error) {
      setActionError(getBookingsErrorMessage(error));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [bookingId, cancelReason, detail, load, getBookingsErrorMessage]);

  const statusOptions = useMemo(
    () =>
      BOOKING_STATUSES.map((status) => ({
        value: status,
        label: getBookingStatusLabel(status, statusLabels),
      })),
    [statusLabels],
  );

  const itemColumns = useMemo<ColumnDef<BookingItem, unknown>[]>(
    () => [
      {
        accessorKey: 'itemType',
        header: tCommon('columns.type'),
        cell: ({ row }) => (
          <BookingItemTypeIcon itemType={row.original.itemType} size="sm" showLabel />
        ),
      },
      {
        accessorKey: 'titleSnapshot',
        header: tCommon('columns.label'),
        cell: ({ row }) => (
          <BookingItemCatalogLink
            itemType={row.original.itemType}
            referenceId={row.original.referenceId}
            title={row.original.titleSnapshot}
          />
        ),
      },
      {
        accessorKey: 'quantity',
        header: tCommon('columns.quantityShort'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.quantity}</span>
        ),
      },
      {
        id: 'unitPrice',
        header: tCommon('columns.unitPrice'),
        meta: { align: 'right' },
        cell: ({ row }) =>
          detail ? (
            <span className="tabular-nums text-sm font-medium">
              {formatMoney(row.original.unitPriceCents, detail.currency)}
            </span>
          ) : (
            row.original.unitPriceCents
          ),
      },
      {
        id: 'dates',
        header: tCommon('columns.dates'),
        cell: ({ row }) => {
          const { startDate, endDate } = row.original;
          if (!startDate) return emptyDash;
          if (startDate === endDate || !endDate) return startDate;
          return `${startDate} → ${endDate}`;
        },
      },
    ],
    [detail, emptyDash, tCommon],
  );

  const paymentColumns = useMemo<ColumnDef<BookingPayment, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: tCommon('columns.date'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
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
        accessorKey: 'status',
        header: tCommon('columns.status'),
        meta: { align: 'center' },
        cell: ({ row }) => paymentStatusLabels[row.original.status],
      },
      {
        accessorKey: 'provider',
        header: tCommon('columns.provider'),
        cell: ({ row }) =>
          formatPaymentProvider(row.original.provider, providerLabels, emptyDash),
      },
    ],
    [emptyDash, paymentStatusLabels, providerLabels, tCommon],
  );

  if (state.status === 'loading' && !detail) {
    return (
      <div className="space-y-6">
        <AdminPageBackLink href="/reservations" label={t('backLink')} />
        <BookingDetailSkeleton />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/reservations" label={t('backLink')} />
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      </div>
    );
  }

  if (!detail) {
    return null;
  }

  const { booking, client } = detail;
  const canCancel =
    booking.status === 'pending_payment' || booking.status === 'confirmed';
  const statusUnchanged = newStatus === booking.status;
  const trimmedStatusReason = statusReason.trim();

  return (
    <div className="space-y-6">
      <AdminPageBackLink href="/reservations" label={t('backLink')} />

      {actionError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {actionError}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.6fr)] lg:items-start">
        <div className="space-y-6 lg:sticky lg:top-4">
          <Card variant="dashboard" padding="md">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-atg-fg">{t('sections.client')}</h2>
              <DataTableBadge variant={BOOKING_STATUS_VARIANTS[booking.status]}>
                {getBookingStatusLabel(booking.status, statusLabels)}
              </DataTableBadge>
            </div>
            <p className="mb-4 font-mono text-xs text-atg-muted">
              {t('reference', { idPrefix: formatBookingRef(booking.id) })}
            </p>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-atg-muted">{t('clientFields.email')}</dt>
                <dd className="font-medium text-atg-fg">{client.email}</dd>
              </div>
              <div>
                <dt className="text-atg-muted">{t('clientFields.name')}</dt>
                <dd>
                  {client.firstName} {client.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-atg-muted">{t('clientFields.organization')}</dt>
                <dd>{client.organizationName ?? emptyDash}</dd>
              </div>
              <div>
                <dt className="text-atg-muted">{t('clientFields.total')}</dt>
                <dd className="tabular-nums text-base font-semibold text-atg-fg">
                  {formatMoney(detail.totalCents, detail.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-atg-muted">{t('clientFields.createdAt')}</dt>
                <dd className="tabular-nums">{formatDateTime(booking.createdAt)}</dd>
              </div>
            </dl>
          </Card>

          <Card variant="dashboard" padding="md">
            <h2 className="mb-4 text-lg font-semibold text-atg-fg">{t('sections.status')}</h2>
            <BookingStatusTimeline
              currentStatus={booking.status}
              history={detail.statusHistory}
            />
          </Card>

          {canWrite ? (
            <Card variant="dashboard" padding="md" className="space-y-6">
              <h2 className="text-lg font-semibold text-atg-fg">{t('sections.actions')}</h2>
              <div className="space-y-3">
                <Select
                  label={t('actions.changeStatus')}
                  value={newStatus}
                  options={statusOptions}
                  onChange={(e) => setNewStatus(e.target.value as BookingStatus)}
                />
                <label htmlFor={statusReasonId} className="block text-sm font-medium text-atg-fg">
                  {t('actions.statusReason')}
                </label>
                <textarea
                  id={statusReasonId}
                  rows={2}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg"
                  placeholder={t('actions.statusReasonPlaceholder')}
                />
                <Button
                  type="button"
                  onClick={() => setStatusDialogOpen(true)}
                  disabled={actionLoading || statusUnchanged}
                  loading={actionLoading && statusDialogOpen}
                >
                  {t('actions.applyStatus')}
                </Button>
              </div>

              {canCancel ? (
                <div className="space-y-3 border-t border-atg-border pt-6">
                  <h3 className="text-sm font-semibold text-atg-fg">{t('actions.cancellation')}</h3>
                  <label htmlFor={cancelReasonId} className="block text-sm font-medium text-atg-fg">
                    {t('actions.cancelReason')}
                  </label>
                  <textarea
                    id={cancelReasonId}
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg"
                    placeholder={t('actions.cancelReasonPlaceholder')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="!text-red-600 hover:!bg-red-50 dark:!text-red-400"
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={actionLoading}
                  >
                    {t('actions.cancelBooking')}
                  </Button>
                </div>
              ) : null}
            </Card>
          ) : (
            <Card variant="dashboard" padding="md">
              <p className="text-sm text-atg-muted">{t('actions.readOnly')}</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-atg-fg">{t('sections.bookingLines')}</h2>
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <DataTable
                columns={itemColumns}
                data={detail.items}
                emptyMessage={t('linesEmpty')}
                getRowId={(row) => row.id}
                aria-label={t('linesAriaLabel')}
              />
            </Card>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-atg-fg">{t('sections.payments')}</h2>
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <DataTable
                columns={paymentColumns}
                data={detail.payments}
                emptyMessage={t('paymentsEmpty')}
                getRowId={(row) => row.id}
                aria-label={t('paymentsAriaLabel')}
              />
            </Card>
          </section>
        </div>
      </div>

      <AlertDialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          if (!actionLoading) setStatusDialogOpen(open);
        }}
        title={t('statusDialog.title')}
        description={t('statusDialog.description', {
          fromStatus: getBookingStatusLabel(booking.status, statusLabels),
          toStatus: getBookingStatusLabel(newStatus, statusLabels),
          reasonSuffix: trimmedStatusReason
            ? t('statusDialog.reasonSuffix', { reason: trimmedStatusReason })
            : '',
        })}
        confirmLabel={tActions('confirm')}
        cancelLabel={tActions('cancel')}
        loading={actionLoading}
        onConfirm={() => {
          void handleUpdateStatus().then((ok) => {
            if (ok) setStatusDialogOpen(false);
          });
        }}
        onCancel={() => setStatusDialogOpen(false)}
      />

      <AlertDialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          if (!actionLoading) setCancelDialogOpen(open);
        }}
        title={t('cancelDialog.title')}
        description={t('cancelDialog.description')}
        confirmLabel={t('cancelDialog.confirm')}
        cancelLabel={t('cancelDialog.cancel')}
        variant="danger"
        loading={actionLoading}
        onConfirm={() => {
          void handleCancel().then((ok) => {
            if (ok) setCancelDialogOpen(false);
          });
        }}
        onCancel={() => setCancelDialogOpen(false)}
      />
    </div>
  );
}
