'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTableBadge,
  DataTablePagination,
  EmptyState,
  Skeleton,
} from '@africatourismgate/ui';
import type {
  AdminSupportTicketListItem,
  SupportTicketPriority,
  SupportTicketStatus,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  useFormatDateTime,
  useSupportTicketPriorityFilterOptions,
  useSupportTicketPriorityLabels,
  useSupportTicketStatusFilterOptions,
  useSupportTicketStatusLabels,
} from '../../lib/i18n/use-module-labels';
import {
  formatSupportTicketAssignee,
  supportTicketPriorityVariants,
  supportTicketStatusVariants,
} from '../../lib/support-ticket-display';

const PAGE_SIZE = 20;

type SupportTicketInboxItemProps = {
  ticket: AdminSupportTicketListItem;
};

function SupportTicketInboxItem({ ticket }: SupportTicketInboxItemProps) {
  const t = useTranslations('modules.support');
  const tCommon = useTranslations('modules.common');
  const formatDateTime = useFormatDateTime();
  const statusLabels = useSupportTicketStatusLabels();
  const priorityLabels = useSupportTicketPriorityLabels();
  const unassignedLabel = t('assignee.unassigned');
  const assignee = formatSupportTicketAssignee(null, unassignedLabel);
  const isUnassigned = assignee === unassignedLabel;
  const emptyDash = tCommon('empty.dash');

  return (
    <Link
      href={`/contenu/tickets/${ticket.id}`}
      className="block border-b border-atg-border px-4 py-3 transition-colors last:border-b-0 hover:bg-atg-elevated/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <p className="min-w-0 flex-1 font-medium text-atg-fg">{ticket.subject}</p>
        <time
          className="shrink-0 text-xs tabular-nums text-atg-muted"
          dateTime={ticket.createdAt}
        >
          {formatDateTime(ticket.createdAt)}
        </time>
      </div>

      <p className="mt-1 truncate text-sm text-atg-muted">
        {ticket.customerFirstName?.trim() || emptyDash}
        {ticket.customerEmail ? (
          <span className="text-atg-muted"> · {ticket.customerEmail}</span>
        ) : null}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <DataTableBadge variant={supportTicketStatusVariants[ticket.status]}>
          {statusLabels[ticket.status]}
        </DataTableBadge>
        <DataTableBadge variant={supportTicketPriorityVariants[ticket.priority]}>
          {priorityLabels[ticket.priority]}
        </DataTableBadge>
        <span className="text-xs text-atg-muted">
          {t('list.assignedLabel')}{' '}
          <span className={isUnassigned ? 'italic text-atg-muted' : 'text-atg-fg'}>
            {assignee}
          </span>
        </span>
      </div>
    </Link>
  );
}

function SupportTicketInboxSkeleton() {
  return (
    <div className="divide-y divide-atg-border">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="space-y-2 px-4 py-3 sm:px-5">
          <div className="flex justify-between gap-4">
            <Skeleton className="h-5 w-2/3 max-w-sm" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SupportTicketsList() {
  const { supportTickets: getSupportTicketsErrorMessage } = useAdminErrorMessages();
  const tList = useTranslations('modules.support.list');
  const tColumns = useTranslations('modules.common.columns');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const statusOptions = useSupportTicketStatusFilterOptions();
  const priorityOptions = useSupportTicketPriorityFilterOptions();
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
  }, [page, statusFilter, priorityFilter, filterTick, getSupportTicketsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = useCallback(() => {
    setPage(1);
    setFilterTick((t) => t + 1);
  }, []);

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const tickets = state.status === 'ready' ? state.tickets : [];
  const hasFilters = statusFilter !== '' || priorityFilter !== '';
  const isEmpty = state.status === 'ready' && state.total === 0;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label
              htmlFor={statusFilterId}
              className="mb-1 block text-xs font-medium text-atg-muted"
            >
              {tColumns('status')}
            </label>
            <select
              id={statusFilterId}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as '' | SupportTicketStatus)
              }
              className="w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-fg"
            >
              {statusOptions.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor={priorityFilterId}
              className="mb-1 block text-xs font-medium text-atg-muted"
            >
              {tList('filters.priority')}
            </label>
            <select
              id={priorityFilterId}
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as '' | SupportTicketPriority)
              }
              className="w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-fg"
            >
              {priorityOptions.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={applyFilters} className="w-full sm:w-auto">
              {tCommon('filters.apply')}
            </Button>
          </div>
        </div>
      </Card>

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : null}

      {isLoading ? (
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <SupportTicketInboxSkeleton />
        </Card>
      ) : isEmpty ? (
        <EmptyState
          title={
            hasFilters
              ? tList('empty.filtered.title')
              : tList('empty.default.title')
          }
          description={
            hasFilters
              ? tList('empty.filtered.description')
              : tList('empty.default.description')
          }
        />
      ) : (
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <div role="list" aria-label={tList('ariaLabel')}>
            {tickets.map((ticket) => (
              <div key={ticket.id} role="listitem">
                <SupportTicketInboxItem ticket={ticket} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {state.status === 'ready' && state.totalPages > 1 ? (
        <DataTablePagination
          page={page}
          pageSize={PAGE_SIZE}
          totalPages={state.totalPages}
          totalItems={state.total}
          itemLabel={tPagination('ticket')}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
