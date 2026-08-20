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
  Select,
  Button,
  useToast,
  type ColumnDef,
  type SortingState,
} from '@africatourismgate/ui';
import type { BookingListItem, BookingStatus, OrganizationListItem, User } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  BOOKING_STATUS_VARIANTS,
  getBookingStatusLabel,
} from '../../lib/booking-status';
import {
  useBookingStatusFilterOptions,
  useBookingStatusLabels,
} from '../../lib/i18n/use-module-labels';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { exportCsv } from '../../lib/export-csv';

const PAGE_SIZE = 10;

type StatusFilter = '' | BookingStatus;

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

function formatMoney(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function BookingsList() {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const locale = useLocale();
  const t = useTranslations('modules.bookings.list');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tActions = useTranslations('common.actions');
  const tExport = useTranslations('modules.common.exportCsv');
  const tUsers = useTranslations('modules.users.filters');
  const statusLabels = useBookingStatusLabels();
  const statusOptions = useBookingStatusFilterOptions();
  const paginationLabels = useDataTablePaginationLabels();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [userFilter, setUserFilter] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; bookings: BookingListItem[]; total: number; totalPages: number }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    async function loadFilters() {
      try {
        const client = getApiClient();
        const [orgs, usersResult] = await Promise.all([
          client.listOrganizations({ page: 1, limit: 100 }),
          client.listUsers({ page: 1, limit: 100, status: 'active' }),
        ]);
        if (!cancelled) {
          setOrganizations(orgs.data);
          setUsers(usersResult.data);
        }
      } catch {
        if (!cancelled) {
          setOrganizations([]);
          setUsers([]);
        }
      }
    }
    void loadFilters();
    return () => {
      cancelled = true;
    };
  }, []);

  const orgNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const org of organizations) {
      map.set(org.id, org.name);
    }
    return map;
  }, [organizations]);

  const clientOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.all') },
      ...users.map((user) => ({ value: user.id, label: user.email })),
    ],
    [users, tCommon],
  );

  const organizationOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.allFeminine') },
      ...organizations.map((org) => ({ value: org.id, label: org.name })),
    ],
    [organizations, tCommon],
  );

  const sortOrder = useMemo(() => {
    const createdAtSort = sorting.find((entry) => entry.id === 'createdAt');
    if (!createdAtSort) return 'desc' as const;
    return createdAtSort.desc ? ('desc' as const) : ('asc' as const);
  }, [sorting]);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listBookings({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        userId: userFilter || undefined,
        organizationId: organizationFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortOrder,
      });
      setState({
        status: 'ready',
        bookings: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getBookingsErrorMessage(error) });
    }
  }, [page, statusFilter, userFilter, organizationFilter, dateFrom, dateTo, sortOrder, getBookingsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeFilterCount = [
    statusFilter !== '',
    userFilter !== '',
    organizationFilter !== '',
    dateFrom !== '',
    dateTo !== '',
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;

  const statusTabs = useMemo(
    () => [
      { value: '' as StatusFilter, label: t('tabs.all') },
      { value: 'pending_approval' as StatusFilter, label: t('tabs.pendingApproval') },
    ],
    [t],
  );

  const handleClearFilters = useCallback(() => {
    setStatusFilter('');
    setUserFilter('');
    setOrganizationFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }, []);

  const emptyDash = tCommon('empty.dash');

  const columns = useMemo<ColumnDef<BookingListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: tCommon('columns.date'),
        enableSorting: true,
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums">
            {formatDateTime(row.original.createdAt, locale)}
          </span>
        ),
      },
      {
        id: 'client',
        header: tCommon('columns.client'),
        cell: ({ row }) => (
          <div className="min-w-0">
            <span className="block truncate font-medium text-atg-fg">{row.original.clientEmail}</span>
            <p className="truncate text-xs text-atg-muted">
              {row.original.clientFirstName} {row.original.clientLastName}
            </p>
          </div>
        ),
      },
      {
        id: 'organization',
        header: tCommon('columns.organization'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => {
          const orgId = row.original.organizationId;
          if (!orgId) {
            return <span className="text-atg-muted">{emptyDash}</span>;
          }
          return (
            <span className="text-sm text-atg-muted">
              {orgNameById.get(orgId) ?? orgId.slice(0, 8)}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: tCommon('columns.status'),
        meta: { align: 'center' },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="flex flex-col items-center gap-1">
              <DataTableBadge variant={BOOKING_STATUS_VARIANTS[status]}>
                {getBookingStatusLabel(status, statusLabels)}
              </DataTableBadge>
              {row.original.unreadCustomerMessage ? (
                <DataTableBadge variant="warning">{t('unreadCustomerMessage')}</DataTableBadge>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'total',
        header: tCommon('columns.amount'),
        meta: { align: 'right', hideOnMobile: true },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-medium">
            {formatMoney(row.original.totalCents, row.original.currency)}
          </span>
        ),
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
              href={`/dashboard/bookings/${row.original.id}`}
            />
          </DataTableActions>
        ),
      },
    ],
    [emptyDash, locale, orgNameById, statusLabels, t, tActions, tCommon],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const bookings = state.status === 'ready' ? state.bookings : [];
  const emptyMessage = hasFilters ? t('emptyFiltered') : t('emptyDefault');

  const handleExportCsv = useCallback(() => {
    if (bookings.length === 0) return;
    const date = new Date().toISOString().slice(0, 10);
    exportCsv({
      filename: `reservations-${date}.csv`,
      columns: [
        { header: tCommon('columns.date'), value: (row) => formatDateTime(row.createdAt, locale) },
        { header: tCommon('columns.client'), value: (row) => row.clientEmail },
        {
          header: tCommon('columns.organization'),
          value: (row) =>
            row.organizationId
              ? (orgNameById.get(row.organizationId) ?? row.organizationId)
              : emptyDash,
        },
        {
          header: tCommon('columns.status'),
          value: (row) => getBookingStatusLabel(row.status, statusLabels),
        },
        {
          header: tCommon('columns.amount'),
          value: (row) => formatMoney(row.totalCents, row.currency),
        },
      ],
      rows: bookings,
    });
    toast({ variant: 'success', message: tExport('success') });
  }, [bookings, emptyDash, locale, orgNameById, statusLabels, tCommon, tExport, toast]);

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
              setStatusFilter(tab.value);
              setPage(1);
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
            disabled={isLoading || bookings.length === 0}
            onClick={handleExportCsv}
          >
            {tExport('button')}
          </Button>
        }
        filters={
          <>
            <div className="w-full sm:w-48">
              <Select
                label={tCommon('columns.status')}
                value={statusFilter}
                options={statusOptions}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-56">
              <Select
                label={t('filters.client')}
                value={userFilter}
                options={clientOptions}
                onChange={(e) => {
                  setUserFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
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
              data={bookings}
              isLoading={isLoading}
              loadingMessage={tDataTable('loading')}
              emptyMessage={emptyMessage}
              emptyVariant={hasFilters ? 'search' : 'default'}
              expandRowLabel={tDataTable('expandRow')}
              collapseRowLabel={tDataTable('collapseRow')}
              expandRowAriaLabel={tDataTable('expandRowAria')}
              getRowId={(row) => row.id}
              sorting={sorting}
              onSortingChange={(updater) => {
                setSorting((current) => {
                  const next = typeof updater === 'function' ? updater(current) : updater;
                  return next.length > 0 ? next : [{ id: 'createdAt', desc: true }];
                });
                setPage(1);
              }}
              manualSorting
              aria-label={t('ariaLabel')}
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tCommon('pagination.booking')}
              labels={paginationLabels}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
