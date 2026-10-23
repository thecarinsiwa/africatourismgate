'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Input,
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
  type ActivityBookingRequestStatus,
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

export function ActivityBookingRequestsList() {
  const { activities: getActivitiesErrorMessage } = useAdminErrorMessages();
  const locale = useLocale();
  const t = useTranslations('modules.activities.bookingRequests');
  const tCommon = useTranslations('modules.common');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tPagination = useTranslations('modules.common.pagination');
  const tSelect = useTranslations('modules.common.select');
  const tDataTable = useTranslations('modules.common.dataTable');
  const paginationLabels = useDataTablePaginationLabels();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | ActivityBookingRequestStatus>('');
  const [activityFilter, setActivityFilter] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
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

  const handleStatusChange = useCallback(
    async (request: ActivityBookingRequest, nextStatus: ActivityBookingRequestStatus) => {
      if (nextStatus === request.status) return;
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
      } catch (error) {
        toast({
          variant: 'error',
          message: getActivitiesErrorMessage(error),
        });
      } finally {
        setUpdatingId(null);
      }
    },
    [getActivitiesErrorMessage, t, toast],
  );

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
                void handleStatusChange(
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
              action="edit"
              href={`/produits/activites/${row.original.activityId}`}
              label={t('actions.openActivity')}
            />
          </DataTableActions>
        ),
      },
    ],
    [
      activityTitleById,
      handleStatusChange,
      locale,
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
    </div>
  );
}
