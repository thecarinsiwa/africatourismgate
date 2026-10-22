'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTablePagination,
  EmptyState,
  FilterBar,
  Input,
  Select,
} from '@africatourismgate/ui';
import type {
  AdminSupportTicketListItem,
  SupportTicketPriority,
  SupportTicketStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupportListFilter } from '../../config/support-kpi';
import { getApiClient } from '../../lib/auth/api';
import {
  useSupportTicketPriorityFilterOptions,
  useSupportTicketStatusLabels,
} from '../../lib/i18n/use-module-labels';
import { SUPPORT_TICKET_STATUSES } from '../../lib/support-ticket-display';
import {
  SupportTicketInboxItem,
  SupportTicketInboxSkeleton,
} from './support-ticket-inbox-item';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type StatusFilter = '' | SupportTicketStatus;

type SupportTicketsListProps = {
  listFilter?: SupportListFilter;
  onListFilterChange?: (filter: SupportListFilter) => void;
};

export function SupportTicketsList({
  listFilter = {},
  onListFilterChange,
}: SupportTicketsListProps) {
  const { supportTickets: getSupportTicketsErrorMessage } = useAdminErrorMessages();
  const tList = useTranslations('modules.support.list');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const statusLabels = useSupportTicketStatusLabels();
  const priorityOptions = useSupportTicketPriorityFilterOptions();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
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

  const statusFilter: StatusFilter = listFilter.status ?? '';
  const priorityFilter: '' | SupportTicketPriority = listFilter.priority ?? '';

  useEffect(() => {
    setPage(1);
  }, [listFilter]);

  useEffect(() => {
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev === query) return prev;
        setPage(1);
        return query;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listSupportTickets({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: search || undefined,
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
  }, [page, statusFilter, priorityFilter, search, getSupportTicketsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const statusTabs = useMemo(
    () => [
      { value: '' as StatusFilter, label: tList('tabs.all') },
      ...SUPPORT_TICKET_STATUSES.map((status) => ({
        value: status as StatusFilter,
        label: statusLabels[status],
      })),
    ],
    [statusLabels, tList],
  );

  const activeFilterCount = [
    statusFilter !== '',
    priorityFilter !== '',
    search !== '',
  ].filter(Boolean).length;

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setPage(1);
    onListFilterChange?.({});
  }, [onListFilterChange]);

  const handleStatusChange = useCallback(
    (next: StatusFilter) => {
      setPage(1);
      onListFilterChange?.({
        ...(next ? { status: next } : {}),
        ...(priorityFilter ? { priority: priorityFilter } : {}),
      });
    },
    [onListFilterChange, priorityFilter],
  );

  const handlePriorityChange = useCallback(
    (next: '' | SupportTicketPriority) => {
      setPage(1);
      onListFilterChange?.({
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(next ? { priority: next } : {}),
      });
    },
    [onListFilterChange, statusFilter],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const tickets = state.status === 'ready' ? state.tickets : [];
  const hasFilters = activeFilterCount > 0;
  const isEmpty = state.status === 'ready' && state.total === 0;

  return (
    <div className="space-y-5">
      <div
        className="flex min-w-0 flex-wrap gap-2"
        role="tablist"
        aria-label={tList('tabs.ariaLabel')}
      >
        {statusTabs.map((tab) => (
          <Button
            key={tab.value || 'all'}
            type="button"
            size="sm"
            variant={statusFilter === tab.value ? 'primary' : 'outline'}
            role="tab"
            aria-selected={statusFilter === tab.value}
            onClick={() => handleStatusChange(tab.value)}
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
        filters={
          <>
            <div className="min-w-0 w-full flex-1 sm:min-w-[220px] sm:max-w-md">
              <Input
                name="search"
                type="search"
                placeholder={tList('filters.search')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={tList('filters.searchAria')}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label={tList('filters.priority')}
                value={priorityFilter}
                options={priorityOptions}
                onChange={(e) => {
                  handlePriorityChange(e.target.value as '' | SupportTicketPriority);
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

      {state.status === 'ready' && !isEmpty ? (
        <p className="text-sm text-atg-muted">
          {tList('resultsCount', { count: state.total })}
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
              : tList('empty.all.title')
          }
          description={
            hasFilters
              ? tList('empty.filtered.description')
              : tList('empty.all.description')
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
