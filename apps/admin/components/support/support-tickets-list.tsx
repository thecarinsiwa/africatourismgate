'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Card,
  DataTableBadge,
  DataTablePagination,
  EmptyState,
  FilterBar,
  Select,
  Skeleton,
} from '@africatourismgate/ui';
import type {
  AdminSupportTicketListItem,
  SupportTicketPriority,
  SupportTicketStatus,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  useFormatDateTime,
  useSupportTicketPriorityFilterOptions,
  useSupportTicketPriorityLabels,
  useSupportTicketStatusFilterOptions,
  useSupportTicketStatusLabels,
} from '../../lib/i18n/use-module-labels';
import {
  supportTicketPriorityVariants,
  supportTicketStatusVariants,
} from '../../lib/support-ticket-display';

const PAGE_SIZE = 20;
const DEFAULT_STATUS: SupportTicketStatus = 'open';

type SupportTicketInboxItemProps = {
  ticket: AdminSupportTicketListItem;
};

function SupportTicketInboxItem({ ticket }: SupportTicketInboxItemProps) {
  const tCommon = useTranslations('modules.common');
  const formatDateTime = useFormatDateTime();
  const statusLabels = useSupportTicketStatusLabels();
  const priorityLabels = useSupportTicketPriorityLabels();
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

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | SupportTicketStatus>(DEFAULT_STATUS);
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
  }, [page, statusFilter, priorityFilter, getSupportTicketsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeFilterCount = [
    statusFilter !== DEFAULT_STATUS,
    priorityFilter !== '',
  ].filter(Boolean).length;

  const handleClearFilters = useCallback(() => {
    setStatusFilter(DEFAULT_STATUS);
    setPriorityFilter('');
    setPage(1);
  }, []);

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const tickets = state.status === 'ready' ? state.tickets : [];
  const hasFilters = activeFilterCount > 0;
  const isEmpty = state.status === 'ready' && state.total === 0;

  return (
    <div className="space-y-6">
      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={handleClearFilters}
        clearLabel={tCommon('filters.clearAll')}
        applyLabel={tCommon('filters.apply')}
        toggleLabel={tCommon('filters.toggle')}
        filters={
          <>
            <div className="w-full sm:w-44">
              <Select
                label={tColumns('status')}
                value={statusFilter}
                options={statusOptions}
                onChange={(e) => {
                  setStatusFilter(e.target.value as '' | SupportTicketStatus);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label={tList('filters.priority')}
                value={priorityFilter}
                options={priorityOptions}
                onChange={(e) => {
                  setPriorityFilter(e.target.value as '' | SupportTicketPriority);
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
