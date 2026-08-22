'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableBadge,
  Modal,
  Select,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  BookingAdminDetail,
  BookingItem,
  BookingPayment,
  BookingStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AdminPageBackLink } from '../admin-page-back-link';
import { getApiClient } from '../../lib/auth/api';
import {
  BOOKING_STATUS_VARIANTS,
  defaultManualBookingStatusTarget,
  getBookingStatusLabel,
  getManualBookingStatusTargets,
} from '../../lib/booking-status';
import { formatMoney } from '../../lib/format-money';
import {
  useBookingStatusLabels,
  useFormatDateTime,
  usePaymentProviderLabels,
  usePaymentStatusLabels,
} from '../../lib/i18n/use-module-labels';
import { formatPaymentProvider } from '../../lib/payment-display';
import { BookingItemCatalogLink } from './booking-item-catalog-link';
import { BookingItemTypeIcon } from './booking-item-type-icon';
import { BookingGuidesSection } from './booking-guides-section';
import { BookingAssistedApprovalPanel } from './booking-assisted-approval-panel';
import { BookingIdentityDocumentsPanel } from './booking-identity-documents-panel';
import { BookingManifestSection } from './booking-manifest-section';
import { BookingMessagesSection } from './booking-messages-section';
import { BookingStatusTimeline } from './booking-status-timeline';

function formatBookingRef(id: string): string {
  return id.slice(0, 8);
}

const actionErrorClassName =
  'rounded-lg border border-red-500 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-400';

type BookingDetailPageProps = {
  bookingId: string;
};

function BookingDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-56 w-full rounded-xl" />
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
  const formatDateTime = useFormatDateTime('mediumTime');

  const [canWrite, setCanWrite] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
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
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('manifest');
  const [manifestSync, setManifestSync] = useState(0);

  const bumpManifestSync = useCallback(() => {
    setManifestSync((value) => value + 1);
  }, []);

  useAdminEditPageMeta({
    ready: state.status === 'ready' && detail != null,
    title: t('title'),
    entityLabel:
      detail != null
        ? t('reference', { idPrefix: formatBookingRef(detail.booking.id) })
        : undefined,
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await getApiClient().getBooking(bookingId);
      setDetail(data);
      const allowedTargets = getManualBookingStatusTargets(data.booking.status);
      setNewStatus(defaultManualBookingStatusTarget(data.booking.status, allowedTargets));
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getBookingsErrorMessage(error) });
    }
  }, [bookingId, getBookingsErrorMessage]);

  const refreshDetail = useCallback(async () => {
    await load();
    bumpManifestSync();
  }, [load, bumpManifestSync]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (
      detail?.identityDocuments?.some((doc) => doc.status === 'pending_review')
    ) {
      setActiveTab('documents');
    } else {
      setActiveTab('manifest');
    }
  }, [bookingId, detail?.booking.id, detail?.identityDocuments]);

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setCanWrite(me.isSuperAdmin || me.permissions.includes('bookings.write'));
          setCanApprove(
            me.isSuperAdmin ||
              me.permissions.includes('bookings.approve') ||
              me.permissions.includes('bookings.write'),
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCanWrite(false);
          setCanApprove(false);
        }
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

  const statusOptions = useMemo(() => {
    const current = detail?.booking.status;
    const allowed = current ? getManualBookingStatusTargets(current) : [];
    return allowed.map((status) => ({
      value: status,
      label: getBookingStatusLabel(status, statusLabels),
    }));
  }, [detail?.booking.status, statusLabels]);

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
    [emptyDash, formatDateTime, paymentStatusLabels, providerLabels, tCommon],
  );

  if (state.status === 'loading' && !detail) {
    return (
      <div className="min-w-0 space-y-6">
        <AdminPageBackLink href="/reservations" label={t('backLink')} />
        <BookingDetailSkeleton />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="min-w-0 space-y-4">
        <AdminPageBackLink href="/reservations" label={t('backLink')} />
        <p role="alert" className={actionErrorClassName}>
          {state.message}
        </p>
      </div>
    );
  }

  if (!detail) {
    return null;
  }

  const { booking, client } = detail;
  const suggestedTravelerCount = detail.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const manualStatusTargets = getManualBookingStatusTargets(booking.status);
  const showManualStatusChange = canWrite && manualStatusTargets.length > 0;
  const canCancel =
    booking.status === 'pending_payment' || booking.status === 'confirmed';
  const statusUnchanged = newStatus === booking.status;
  const trimmedStatusReason = statusReason.trim();
  const identityDocuments = detail.identityDocuments ?? [];
  const pendingDocumentCount = identityDocuments.filter(
    (doc) => doc.status === 'pending_review',
  ).length;
  const unreadMessageCount = detail.unreadCustomerMessageCount ?? 0;
  const clientName = `${client.firstName} ${client.lastName}`.trim();
  const showActionsBar =
    canWrite && (showManualStatusChange || canCancel || booking.status === 'pending_approval');

  return (
    <div className={`min-w-0 space-y-6${showActionsBar ? ' pb-24' : ''}`}>
      <AdminPageBackLink href="/reservations" label={t('backLink')} />

      {actionError ? (
        <p role="alert" className={actionErrorClassName}>
          {actionError}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] lg:items-start">
        <Card variant="dashboard" padding="md" className="min-w-0 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-atg-fg">
                  {clientName || client.email}
                </h2>
                <DataTableBadge variant={BOOKING_STATUS_VARIANTS[booking.status]}>
                  {getBookingStatusLabel(booking.status, statusLabels)}
                </DataTableBadge>
              </div>
              <p className="text-sm">
                <a
                  href={`mailto:${client.email}`}
                  className="font-medium text-primary hover:underline"
                >
                  {client.email}
                </a>
              </p>
              {client.organizationName ? (
                <p className="text-sm text-atg-muted">{client.organizationName}</p>
              ) : null}
              <p className="font-mono text-xs text-atg-muted">
                {t('reference', { idPrefix: formatBookingRef(booking.id) })}
              </p>
              {unreadMessageCount > 0 ? (
                <p className="text-sm font-medium text-primary">
                  {t('summary.unreadMessages', { count: unreadMessageCount })}
                </p>
              ) : null}
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {t('clientFields.total')}
              </p>
              <p className="tabular-nums text-2xl font-semibold text-atg-fg">
                {formatMoney(detail.totalCents, detail.currency)}
              </p>
              <p className="mt-1 text-sm tabular-nums text-atg-muted">
                {t('summary.createdAt', { date: formatDateTime(booking.createdAt) })}
              </p>
            </div>
          </div>

          <BookingStatusTimeline
            currentStatus={booking.status}
            history={detail.statusHistory}
            showHistory={false}
            className="border-t border-atg-border pt-4"
          />
        </Card>

        <section className="min-w-0 space-y-3">
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

      <BookingAssistedApprovalPanel
        bookingId={bookingId}
        status={booking.status}
        totalCents={detail.totalCents}
        currency={detail.currency}
        items={detail.items}
        canApprove={canApprove}
        manifestSyncKey={manifestSync}
        onUpdated={refreshDetail}
      />

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

      <Card variant="dashboard" padding="md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList aria-label={t('tabs.ariaLabel')}>
            <TabsTrigger value="manifest">{t('tabs.manifest')}</TabsTrigger>
            <TabsTrigger value="guides">{t('tabs.guides')}</TabsTrigger>
            <TabsTrigger value="documents">
              {pendingDocumentCount > 0
                ? t('tabs.documentsPending', { count: pendingDocumentCount })
                : t('tabs.documents')}
            </TabsTrigger>
            <TabsTrigger value="history">{t('tabs.history')}</TabsTrigger>
          </TabsList>

          <TabsContent value="manifest">
            <BookingManifestSection
              bookingId={bookingId}
              canWrite={canWrite}
              suggestedCount={suggestedTravelerCount}
              syncKey={manifestSync}
              onChanged={bumpManifestSync}
              embedded
            />
          </TabsContent>

          <TabsContent value="guides">
            <BookingGuidesSection bookingId={bookingId} canWrite={canWrite} embedded />
          </TabsContent>

          <TabsContent value="documents">
            <BookingIdentityDocumentsPanel
              bookingId={bookingId}
              documents={identityDocuments}
              canReview={canApprove}
              onUpdated={load}
              embedded
            />
          </TabsContent>

          <TabsContent value="history">
            <BookingStatusTimeline
              currentStatus={booking.status}
              history={detail.statusHistory}
              showProgress={false}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {!canWrite ? (
        <p className="text-sm text-atg-muted">{t('actions.readOnly')}</p>
      ) : null}

      <BookingMessagesSection
        bookingId={bookingId}
        canWrite={canWrite}
        initialUnreadCount={unreadMessageCount}
      />

      {showActionsBar ? (
        <div
          className="sticky bottom-0 z-20 border-t border-atg-border bg-atg-bg/95 px-4 py-3 backdrop-blur"
          role="region"
          aria-label={t('actionsBar.ariaLabel')}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {booking.status === 'pending_approval' && !showManualStatusChange ? (
              <p className="mr-auto text-sm text-atg-muted">{t('actions.assistedStatusHint')}</p>
            ) : null}
            {showManualStatusChange ? (
              <Button
                type="button"
                disabled={actionLoading}
                className="w-full sm:w-auto"
                onClick={() => setStatusModalOpen(true)}
              >
                {t('actions.changeStatus')}
              </Button>
            ) : null}
            {canCancel ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto !text-red-600 hover:!bg-red-50 dark:!text-red-400"
                onClick={() => setCancelModalOpen(true)}
                disabled={actionLoading}
              >
                {t('actions.cancelBooking')}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <Modal
        open={statusModalOpen}
        onOpenChange={(open) => {
          if (!actionLoading) setStatusModalOpen(open);
        }}
        title={t('actions.changeStatus')}
        description={t('actionsBar.statusModalDescription')}
        showClose
        className="max-w-lg"
      >
        <div className="space-y-4">
          <Select
            label={t('actions.changeStatus')}
            value={newStatus}
            options={statusOptions}
            onChange={(e) => setNewStatus(e.target.value as BookingStatus)}
          />
          <Textarea
            name="statusReason"
            label={t('actions.statusReason')}
            rows={3}
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            placeholder={t('actions.statusReasonPlaceholder')}
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={actionLoading}
              onClick={() => setStatusModalOpen(false)}
            >
              {tActions('cancel')}
            </Button>
            <Button
              type="button"
              disabled={actionLoading || statusUnchanged}
              onClick={() => {
                setStatusModalOpen(false);
                setStatusDialogOpen(true);
              }}
            >
              {t('actions.applyStatus')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={cancelModalOpen}
        onOpenChange={(open) => {
          if (!actionLoading) setCancelModalOpen(open);
        }}
        title={t('actions.cancellation')}
        description={t('actionsBar.cancelModalDescription')}
        showClose
        className="max-w-lg"
      >
        <div className="space-y-4">
          <Textarea
            name="cancelReason"
            label={t('actions.cancelReason')}
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder={t('actions.cancelReasonPlaceholder')}
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={actionLoading}
              onClick={() => setCancelModalOpen(false)}
            >
              {tActions('cancel')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="!text-red-600 hover:!bg-red-50 dark:!text-red-400"
              disabled={actionLoading}
              onClick={() => {
                setCancelModalOpen(false);
                setCancelDialogOpen(true);
              }}
            >
              {t('actions.cancelBooking')}
            </Button>
          </div>
        </div>
      </Modal>

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
