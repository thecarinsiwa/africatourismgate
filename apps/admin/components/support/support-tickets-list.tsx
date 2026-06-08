'use client';

import {
  Button,
  Card,
  DataTable,
  DataTableBadge,
  DataTablePagination,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  AdminSupportTicketListItem,
  SupportTicketPriority,
  SupportTicketStatus,
} from '@africatourismgate/types';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getSupportTicketsErrorMessage } from '../../lib/support-tickets-errors';

const PAGE_SIZE = 20;

const statusLabels: Record<SupportTicketStatus, string> = {
  open: 'Ouvert',
  pending: 'En cours',
  resolved: 'Résolu',
  closed: 'Fermé',
};

const statusVariants: Record<
  SupportTicketStatus,
  'success' | 'warning' | 'muted' | 'default'
> = {
  open: 'default',
  pending: 'warning',
  resolved: 'success',
  closed: 'muted',
};

const priorityLabels: Record<SupportTicketPriority, string> = {
  low: 'Basse',
  normal: 'Normale',
  high: 'Haute',
  urgent: 'Urgente',
};

const priorityVariants: Record<
  SupportTicketPriority,
  'success' | 'warning' | 'muted' | 'default'
> = {
  low: 'muted',
  normal: 'default',
  high: 'warning',
  urgent: 'warning',
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

export function SupportTicketsList() {
  const statusFilterId = useId();
  const priorityFilterId = useId();

  const [page, setPage] = useState(1);
  const [filterTick, setFilterTick] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'' | SupportTicketStatus>('');
  const [priorityFilter, setPriorityFilter] = useState<'' | SupportTicketPriority>('');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        tickets: AdminSupportTicketListItem[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });

  const load = useCallback(async () => {
    void filterTick;
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listSupportTickets({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setState({
        status: 'ready',
        tickets: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getSupportTicketsErrorMessage(error) });
    }
  }, [page, statusFilter, priorityFilter, filterTick]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = useCallback(() => {
    setPage(1);
    setFilterTick((t) => t + 1);
  }, []);

  const columns = useMemo<ColumnDef<AdminSupportTicketListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'subject',
        header: 'Sujet',
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.subject}</span>
        ),
      },
      {
        id: 'customer',
        header: 'Client',
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-atg-fg">
              {row.original.customerFirstName?.trim() || '—'}
            </span>
            {row.original.customerEmail ? (
              <p className="text-xs text-atg-muted">{row.original.customerEmail}</p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <DataTableBadge variant={statusVariants[row.original.status]}>
            {statusLabels[row.original.status]}
          </DataTableBadge>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priorité',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <DataTableBadge variant={priorityVariants[row.original.priority]}>
            {priorityLabels[row.original.priority]}
          </DataTableBadge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-atg-muted">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <Button href={`/contenu/tickets/${row.original.id}`} variant="ghost" size="sm">
            Voir
          </Button>
        ),
      },
    ],
    [],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const tickets = state.status === 'ready' ? state.tickets : [];
  const hasFilters = statusFilter !== '' || priorityFilter !== '';

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label
              htmlFor={statusFilterId}
              className="mb-1 block text-xs font-medium text-atg-muted"
            >
              Statut
            </label>
            <select
              id={statusFilterId}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as '' | SupportTicketStatus)
              }
              className="w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-fg"
            >
              <option value="">Tous</option>
              {(Object.keys(statusLabels) as SupportTicketStatus[]).map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor={priorityFilterId}
              className="mb-1 block text-xs font-medium text-atg-muted"
            >
              Priorité
            </label>
            <select
              id={priorityFilterId}
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as '' | SupportTicketPriority)
              }
              className="w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-fg"
            >
              <option value="">Toutes</option>
              {(Object.keys(priorityLabels) as SupportTicketPriority[]).map((p) => (
                <option key={p} value={p}>
                  {priorityLabels[p]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={applyFilters} className="w-full sm:w-auto">
              Appliquer les filtres
            </Button>
          </div>
        </div>
      </Card>

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={tickets}
        isLoading={isLoading}
        emptyMessage={
          hasFilters
            ? 'Aucun ticket ne correspond aux filtres.'
            : 'Aucun ticket pour le moment.'
        }
      />

      {state.status === 'ready' && state.totalPages > 1 ? (
        <DataTablePagination
          page={page}
          pageSize={PAGE_SIZE}
          totalPages={state.totalPages}
          totalItems={state.total}
          itemLabel="tickets"
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
