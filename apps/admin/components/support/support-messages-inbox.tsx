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

type SupportMessagesInboxItemProps = {
  ticket: AdminSupportTicketListItem;
};

function SupportMessagesInboxItem({ ticket }: SupportMessagesInboxItemProps) {
  const tInbox = useTranslations('modules.support.messagesInbox');
  const tCommon = useTranslations('modules.common');
  const formatDateTime = useFormatDateTime();
  const statusLabels = useSupportTicketStatusLabels();
  const priorityLabels = useSupportTicketPriorityLabels();
  const emptyDash = tCommon('empty.dash');
  const customer =
    ticket.customerFirstName?.trim() || ticket.customerEmail || emptyDash;
  const when = ticket.lastMessageAt || ticket.createdAt;
  const preview =
    ticket.lastMessagePreview?.trim() || tInbox('noPreview');
  const authorLabel =
    ticket.lastMessageIsStaff === true
      ? tInbox('fromStaff')
      : ticket.lastMessageIsStaff === false
        ? tInbox('fromCustomer')
        : null;

  return (
    <Link
      href={`/contenu/tickets/${ticket.id}`}
      className="block border-b border-atg-border px-4 py-3 transition-colors last:border-b-0 hover:bg-atg-elevated/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <p className="min-w-0 flex-1 font-medium text-atg-fg">{ticket.subject}</p>
        <time
          className="shrink-0 text-xs tabular-nums text-atg-muted"
          dateTime={when}
        >
          {formatDateTime(when)}
        </time>
      </div>

      <p className="mt-1 truncate text-sm text-atg-muted">
        {customer}
        {authorLabel ? (
          <span className="text-atg-muted"> · {authorLabel}</span>
        ) : null}
      </p>

      <p className="mt-1 line-clamp-2 text-sm text-atg-fg/90">{preview}</p>

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

function SupportMessagesInboxSkeleton() {
  return (
    <div className="divide-y divide-atg-border">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="space-y-2 px-4 py-3 sm:px-5">
          <div className="flex justify-between gap-4">
            <Skeleton className="h-5 w-2/3 max-w-sm" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SupportMessagesInbox() {
  const { supportTickets: getSupportTicketsErrorMessage } = useAdminErrorMessages();
  const tInbox = useTranslations('modules.support.messagesInbox');
  const tList = useTranslations('modules.support.list');
  const tColumns = useTranslations('modules.common.columns');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const statusOptions = useSupportTicketStatusFilterOptions();
  const priorityOptions = useSupportTicketPriorityFilterOptions();

  const [page, setPage] = useState(1);
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
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listSupportTickets({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        sortBy: 'lastMessageAt',
      });
      setState({
        status: 'ready',
        tickets: result.data as AdminSupportTicketListItem[],
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

  const activeFilterCount = [statusFilter !== '', priorityFilter !== ''].filter(
    Boolean,
  ).length;

  const handleClearFilters = useCallback(() => {
    setStatusFilter('');
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
          <SupportMessagesInboxSkeleton />
        </Card>
      ) : isEmpty ? (
        <EmptyState
          title={
            hasFilters
              ? tInbox('empty.filtered.title')
              : tInbox('empty.default.title')
          }
          description={
            hasFilters
              ? tInbox('empty.filtered.description')
              : tInbox('empty.default.description')
          }
        />
      ) : (
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <div role="list" aria-label={tInbox('ariaLabel')}>
            {tickets.map((ticket) => (
              <div key={ticket.id} role="listitem">
                <SupportMessagesInboxItem ticket={ticket} />
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
