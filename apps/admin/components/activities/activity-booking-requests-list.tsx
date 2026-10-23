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
  Modal,
  SearchableSelect,
  Select,
  useToast,
  type ColumnDef,
  type DataTableBadgeVariant,
} from '@africatourismgate/ui';
import {
  ACTIVITY_BOOKING_REQUEST_STATUSES,
  type Activity,
  type ActivityBookingRequest,
  type ActivityBookingRequestAvailability,
  type ActivityBookingRequestStatus,
  type ActivityBookingRequestStatusEmailPreview,
} from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const STATUS_VARIANTS: Record<ActivityBookingRequestStatus, DataTableBadgeVariant> = {
  pending: 'warning',
  contacted: 'default',
  confirmed: 'success',
  cancelled: 'danger',
};

function formatDateTime(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function formatDateOnly(iso: string, locale: string): string {
  try {
    return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString(locale, {
      dateStyle: 'medium',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function preferredDateToLocalInput(dateOnly: string): string {
  const day = dateOnly.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? `${day}T09:00` : '';
}

type SlotFormValues = {
  startDatetime: string;
  capacity: string;
};

export function ActivityBookingRequestsList() {
  const { activities: getActivitiesErrorMessage } = useAdminErrorMessages();
  const locale = useLocale();
  const t = useTranslations('modules.activities.bookingRequests');
  const tSchedules = useTranslations('modules.activities.sections.schedules');
  const tCommon = useTranslations('modules.common');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tPagination = useTranslations('modules.common.pagination');
  const tSelect = useTranslations('modules.common.select');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const paginationLabels = useDataTablePaginationLabels();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | ActivityBookingRequestStatus>('');
  const [activityFilter, setActivityFilter] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [slotTarget, setSlotTarget] = useState<ActivityBookingRequest | null>(null);
  const [slotForm, setSlotForm] = useState<SlotFormValues>({
    startDatetime: '',
    capacity: '10',
  });
  const [slotError, setSlotError] = useState<string | null>(null);
  const [slotSubmitting, setSlotSubmitting] = useState(false);
  const [statusConfirm, setStatusConfirm] = useState<{
    request: ActivityBookingRequest;
    nextStatus: ActivityBookingRequestStatus;
  } | null>(null);
  const [emailPreview, setEmailPreview] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; preview: ActivityBookingRequestStatusEmailPreview }
  >({ status: 'loading' });
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        requests: ActivityBookingRequest[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });

  const activityTitleById = useMemo(
    () => new Map(activities.map((activity) => [activity.id, activity.title])),
    [activities],
  );

  const statusOptions = useMemo(
    () => [
      { value: '', label: t('filters.allStatuses') },
      ...ACTIVITY_BOOKING_REQUEST_STATUSES.map((status) => ({
        value: status,
        label: t(`status.${status}`),
      })),
    ],
    [t],
  );

  const activityOptions = useMemo(
    () => [
      { value: '', label: t('filters.allActivities') },
      ...activities.map((activity) => ({
        value: activity.id,
        label: activity.title,
      })),
    ],
    [activities, t],
  );

  const activeFilterCount =
    (search ? 1 : 0) + (statusFilter ? 1 : 0) + (activityFilter ? 1 : 0);

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('');
    setActivityFilter('');
    setPage(1);
  }, []);

  useEffect(() => {
    void getApiClient()
      .listActivities({ page: 1, limit: 100 })
      .then((result) => setActivities(result.data))
      .catch(() => setActivities([]));
  }, []);

  useEffect(() => {
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== query) setPage(1);
        return query;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listActivityBookingRequests({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        activityId: activityFilter || undefined,
      });
      setState({
        status: 'ready',
        requests: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getActivitiesErrorMessage(error) });
    }
  }, [page, search, statusFilter, activityFilter, getActivitiesErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const closeStatusConfirm = useCallback(() => {
    setStatusConfirm(null);
    setEmailPreview({ status: 'loading' });
  }, []);

  const closeSlotModal = useCallback(() => {
    if (slotSubmitting) return;
    setSlotTarget(null);
    setSlotError(null);
    setSlotForm({ startDatetime: '', capacity: '10' });
  }, [slotSubmitting]);

  const openSlotModal = useCallback((request: ActivityBookingRequest) => {
    setSlotTarget(request);
    setSlotError(null);
    setSlotForm({
      startDatetime: preferredDateToLocalInput(request.preferredDate),
      capacity: String(Math.max(1, request.participants)),
    });
  }, []);

  const handleCreateSlot = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!slotTarget) return;
      setSlotError(null);
      if (!slotForm.startDatetime) {
        setSlotError(tSchedules('validationDateTime'));
        return;
      }
      const capacity = Number(slotForm.capacity);
      if (!Number.isFinite(capacity) || capacity < 1) {
        setSlotError(tSchedules('validationCapacity'));
        return;
      }
      setSlotSubmitting(true);
      try {
        await getApiClient().createActivitySchedule({
          activityId: slotTarget.activityId,
          startDatetime: new Date(slotForm.startDatetime).toISOString(),
          capacity,
        });
        toast({ variant: 'success', message: t('addSlot.success') });
        setSlotTarget(null);
        setSlotForm({ startDatetime: '', capacity: '10' });
      } catch (error) {
        setSlotError(getActivitiesErrorMessage(error));
      } finally {
        setSlotSubmitting(false);
      }
    },
    [getActivitiesErrorMessage, slotForm, slotTarget, t, tSchedules, toast],
  );

  const openStatusConfirm = useCallback(
    (request: ActivityBookingRequest, nextStatus: ActivityBookingRequestStatus) => {
      if (nextStatus === request.status) return;
      setStatusConfirm({ request, nextStatus });
      setEmailPreview({ status: 'loading' });
      void getApiClient()
        .previewActivityBookingRequestStatusEmail(request.id, { status: nextStatus })
        .then((preview) => setEmailPreview({ status: 'ready', preview }))
        .catch((error) =>
          setEmailPreview({
            status: 'error',
            message: getActivitiesErrorMessage(error),
          }),
        );
    },
    [getActivitiesErrorMessage],
  );

  const confirmStatusChange = useCallback(async () => {
    if (!statusConfirm) return;
    const { request, nextStatus } = statusConfirm;
    setUpdatingId(request.id);
    try {
      const updated = await getApiClient().updateActivityBookingRequestStatus(
        request.id,
        { status: nextStatus },
      );
      setState((current) => {
        if (current.status !== 'ready') return current;
        return {
          ...current,
          requests: current.requests.map((row) =>
            row.id === updated.id ? updated : row,
          ),
        };
      });
      toast({ variant: 'success', message: t('statusUpdated') });
      closeStatusConfirm();
    } catch (error) {
      toast({
        variant: 'error',
        message: getActivitiesErrorMessage(error),
      });
    } finally {
      setUpdatingId(null);
    }
  }, [closeStatusConfirm, getActivitiesErrorMessage, statusConfirm, t, toast]);

  const availabilityTone = (
    availability: ActivityBookingRequestAvailability,
  ): string => {
    if (availability === 'available') {
      return 'text-emerald-700 dark:text-emerald-400';
    }
    if (availability === 'unavailable') {
      return 'text-red-700 dark:text-red-400';
    }
    return 'text-amber-700 dark:text-amber-400';
  };

  const columns = useMemo<ColumnDef<ActivityBookingRequest>[]>(
    () => [
      {
        id: 'createdAt',
        header: t('columns.createdAt'),
        meta: {
          hideOnMobile: true,
          mobileDetailLabel: t('columns.createdAt'),
        },
        cell: ({ row }) => formatDateTime(row.original.createdAt, locale),
      },
      {
        id: 'activity',
        header: t('columns.activity'),
        meta: {
          hideOnMobile: true,
          mobileDetailLabel: t('columns.activity'),
        },
        cell: ({ row }) => (
          <span className="block max-w-[14rem] truncate">
            {activityTitleById.get(row.original.activityId) ??
              row.original.activityId.slice(0, 8)}
          </span>
        ),
      },
      {
        id: 'contact',
        header: t('columns.contact'),
        cell: ({ row }) => {
          const activityTitle =
            activityTitleById.get(row.original.activityId) ??
            row.original.activityId.slice(0, 8);
          return (
            <div className="min-w-0">
              <p className="truncate font-medium text-atg-fg">{row.original.fullName}</p>
              <p className="truncate text-xs text-atg-muted">{row.original.email}</p>
              {row.original.phone ? (
                <p className="truncate text-xs text-atg-muted">{row.original.phone}</p>
              ) : null}
              <p className="mt-1 truncate text-xs text-atg-muted md:hidden">
                {activityTitle}
                {' · '}
                {formatDateOnly(row.original.preferredDate, locale)}
                {' · '}
                {row.original.participants}
              </p>
            </div>
          );
        },
      },
      {
        id: 'preferredDate',
        header: t('columns.preferredDate'),
        meta: {
          hideOnMobile: true,
          mobileDetailLabel: t('columns.preferredDate'),
        },
        cell: ({ row }) => formatDateOnly(row.original.preferredDate, locale),
      },
      {
        id: 'participants',
        header: t('columns.participants'),
        meta: {
          align: 'center',
          hideOnMobile: true,
          mobileDetailLabel: t('columns.participants'),
        },
        cell: ({ row }) => row.original.participants,
      },
      {
        id: 'status',
        header: t('columns.status'),
        meta: { cellClassName: 'w-[8.5rem] sm:w-auto' },
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col gap-1.5 sm:min-w-[9rem] sm:gap-2">
            <DataTableBadge
              variant={STATUS_VARIANTS[row.original.status]}
              className="hidden w-fit md:inline-flex"
            >
              {t(`status.${row.original.status}`)}
            </DataTableBadge>
            <Select
              aria-label={t('columns.status')}
              value={row.original.status}
              disabled={updatingId === row.original.id}
              options={ACTIVITY_BOOKING_REQUEST_STATUSES.map((status) => ({
                value: status,
                label: t(`status.${status}`),
              }))}
              onChange={(e) =>
                openStatusConfirm(
                  row.original,
                  e.target.value as ActivityBookingRequestStatus,
                )
              }
            />
          </div>
        ),
      },
      {
        id: 'message',
        header: t('columns.message'),
        meta: {
          hideOnMobile: true,
          mobileDetailLabel: t('columns.message'),
        },
        cell: ({ row }) =>
          row.original.message?.trim() ? (
            <p className="max-w-xs whitespace-pre-wrap break-words text-sm text-atg-muted">
              {row.original.message}
            </p>
          ) : (
            <span className="text-atg-muted">—</span>
          ),
      },
      {
        id: 'actions',
        header: tCommonColumns('actions'),
        meta: { align: 'right', cellClassName: 'w-12 sm:w-auto' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="calendar"
              onClick={() => openSlotModal(row.original)}
              label={t('actions.addSlot')}
            />
          </DataTableActions>
        ),
      },
    ],
    [
      activityTitleById,
      locale,
      openSlotModal,
      openStatusConfirm,
      t,
      tCommonColumns,
      updatingId,
    ],
  );

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden">
      <Card variant="dashboard" padding="md" className="min-w-0 space-y-4 overflow-x-hidden">
        <FilterBar
          mobileVariant="drawer"
          activeCount={activeFilterCount}
          onClear={handleClearFilters}
          clearLabel={tCommon('filters.clearAll')}
          applyLabel={tCommon('filters.apply')}
          toggleLabel={tCommon('filters.toggle')}
          filters={
            <>
              <div className="min-w-0 flex-1 sm:min-w-[200px] sm:max-w-md">
                <Input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  aria-label={t('searchPlaceholder')}
                />
              </div>
              <div className="w-full min-w-0 sm:w-56">
                <SearchableSelect
                  name="activityFilter"
                  label={t('filters.activity')}
                  value={activityFilter}
                  options={activityOptions}
                  onChange={(next) => {
                    setActivityFilter(next);
                    setPage(1);
                  }}
                  searchPlaceholder={tSelect('searchPlaceholder')}
                  emptyMessage={tSelect('empty')}
                  placeholder={t('filters.allActivities')}
                />
              </div>
              <div className="w-full min-w-0 sm:w-48">
                <Select
                  label={t('filters.status')}
                  value={statusFilter}
                  options={statusOptions}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as '' | ActivityBookingRequestStatus);
                    setPage(1);
                  }}
                />
              </div>
            </>
          }
        />

        {state.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        ) : null}

        <DataTable
          columns={columns}
          data={state.status === 'ready' ? state.requests : []}
          isLoading={state.status === 'loading'}
          loadingMessage={tDataTable('loading')}
          emptyMessage={t('empty')}
          expandRowLabel={tDataTable('expandRow')}
          collapseRowLabel={tDataTable('collapseRow')}
          expandRowAriaLabel={tDataTable('expandRowAria')}
          getRowId={(row) => row.id}
          aria-label={t('ariaLabel')}
        />

        {state.status === 'ready' ? (
          <DataTablePagination
            page={page}
            pageSize={PAGE_SIZE}
            totalPages={state.totalPages}
            totalItems={state.total}
            itemLabel={tPagination('request')}
            labels={paginationLabels}
            onPageChange={setPage}
          />
        ) : null}
      </Card>

      <Modal
        open={slotTarget != null}
        onOpenChange={(open) => {
          if (!open) closeSlotModal();
        }}
        title={t('addSlot.title')}
        description={
          slotTarget
            ? t('addSlot.description', {
                activity:
                  activityTitleById.get(slotTarget.activityId) ??
                  slotTarget.activityId.slice(0, 8),
              })
            : undefined
        }
        className="max-w-lg"
        showClose={!slotSubmitting}
        closeAriaLabel={tActions('close')}
      >
        {slotTarget ? (
          <form onSubmit={(e) => void handleCreateSlot(e)} className="space-y-4">
            <p className="text-sm text-atg-muted">
              {t('addSlot.hint', {
                date: formatDateOnly(slotTarget.preferredDate, locale),
                count: slotTarget.participants,
              })}
            </p>
            {slotError ? (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {slotError}
              </p>
            ) : null}
            <Input
              label={tSchedules('dateTime')}
              type="datetime-local"
              value={slotForm.startDatetime}
              onChange={(e) =>
                setSlotForm((prev) => ({ ...prev, startDatetime: e.target.value }))
              }
              disabled={slotSubmitting}
            />
            <Input
              label={tSchedules('capacity')}
              type="number"
              min={1}
              value={slotForm.capacity}
              onChange={(e) =>
                setSlotForm((prev) => ({ ...prev, capacity: e.target.value }))
              }
              disabled={slotSubmitting}
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeSlotModal}
                disabled={slotSubmitting}
              >
                {tActions('cancel')}
              </Button>
              <Button
                type="submit"
                loading={slotSubmitting}
                loadingText={tLoading('submit')}
              >
                {tActions('create')}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={statusConfirm != null}
        onOpenChange={(open) => {
          if (!open) closeStatusConfirm();
        }}
        title={t('statusConfirm.title')}
        description={
          statusConfirm
            ? t('statusConfirm.description', { email: statusConfirm.request.email })
            : undefined
        }
        className="max-w-3xl"
        showClose
      >
        {statusConfirm ? (
          <div className="space-y-4">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                  {t('statusConfirm.toStatus')}
                </dt>
                <dd className="mt-1 text-sm font-medium text-atg-fg">
                  {t(`status.${statusConfirm.nextStatus}`)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                  {t('statusConfirm.availability')}
                </dt>
                <dd
                  className={`mt-1 text-sm font-semibold ${
                    emailPreview.status === 'ready'
                      ? availabilityTone(emailPreview.preview.availability)
                      : 'text-atg-muted'
                  }`}
                >
                  {emailPreview.status === 'ready'
                    ? t(`availability.${emailPreview.preview.availability}`)
                    : '…'}
                </dd>
              </div>
            </dl>

            {emailPreview.status === 'loading' ? (
              <p className="text-sm text-atg-muted">{t('statusConfirm.loadingPreview')}</p>
            ) : null}
            {emailPreview.status === 'error' ? (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {emailPreview.message}
              </p>
            ) : null}
            {emailPreview.status === 'ready' ? (
              <div className="space-y-2">
                <p className="text-sm text-atg-muted">
                  <span className="font-medium text-atg-fg">
                    {t('statusConfirm.emailSubject')}:
                  </span>{' '}
                  {emailPreview.preview.subject}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                  {t('statusConfirm.emailPreview')}
                </p>
                <iframe
                  title={t('statusConfirm.iframeTitle')}
                  srcDoc={emailPreview.preview.html}
                  className="h-[22rem] w-full rounded-lg border border-atg-border bg-white"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeStatusConfirm}
                disabled={updatingId === statusConfirm.request.id}
              >
                {t('statusConfirm.cancel')}
              </Button>
              <Button
                type="button"
                onClick={() => void confirmStatusChange()}
                loading={updatingId === statusConfirm.request.id}
                disabled={emailPreview.status !== 'ready'}
              >
                {t('statusConfirm.confirm')}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
