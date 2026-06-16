'use client';

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
  type ColumnDef,
  type SortingState,
} from '@africatourismgate/ui';
import type { BookingListItem, BookingStatus, OrganizationListItem, User } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getBookingsErrorMessage } from '../../lib/bookings-errors';

const PAGE_SIZE = 10;

type StatusFilter = '' | BookingStatus;

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

function formatMoney(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function BookingsList() {
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

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Tous' },
      ...(Object.keys(statusLabels) as BookingStatus[]).map((status) => ({
        value: status,
        label: statusLabels[status],
      })),
    ],
    [],
  );

  const clientOptions = useMemo(
    () => [
      { value: '', label: 'Tous' },
      ...users.map((user) => ({ value: user.id, label: user.email })),
    ],
    [users],
  );

  const organizationOptions = useMemo(
    () => [
      { value: '', label: 'Toutes' },
      ...organizations.map((org) => ({ value: org.id, label: org.name })),
    ],
    [organizations],
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
  }, [page, statusFilter, userFilter, organizationFilter, dateFrom, dateTo, sortOrder]);

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

  const handleClearFilters = useCallback(() => {
    setStatusFilter('');
    setUserFilter('');
    setOrganizationFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }, []);

  const columns = useMemo<ColumnDef<BookingListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Date',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums">
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
        id: 'organization',
        header: 'Organisation',
        cell: ({ row }) => {
          const orgId = row.original.organizationId;
          if (!orgId) {
            return <span className="text-atg-muted">—</span>;
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
        id: 'total',
        header: 'Montant',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-medium">
            {formatMoney(row.original.totalCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="view"
              href={`/dashboard/bookings/${row.original.id}`}
            />
          </DataTableActions>
        ),
      },
    ],
    [orgNameById],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const bookings = state.status === 'ready' ? state.bookings : [];
  const emptyMessage = hasFilters
    ? 'Aucune réservation ne correspond à vos critères.'
    : 'Aucune réservation pour le moment.';

  return (
    <div className="space-y-6">
      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={handleClearFilters}
        filters={
          <>
            <div className="w-full sm:w-48">
              <Select
                label="Statut"
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
                label="Client"
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
                label="Organisation"
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
                label="Du"
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
                label="Au"
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
              emptyMessage={emptyMessage}
              emptyVariant={hasFilters ? 'search' : 'default'}
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
              aria-label="Liste des réservations"
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="réservation"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
