'use client';

import type { SupportListFilter } from '../../config/support-kpi';
import { SupportTicketsList } from '../support/support-tickets-list';

type ContenuTicketsTabPanelProps = {
  listFilter?: SupportListFilter;
  onListFilterChange?: (filter: SupportListFilter) => void;
};

export function ContenuTicketsTabPanel({
  listFilter = {},
  onListFilterChange,
}: ContenuTicketsTabPanelProps) {
  return (
    <SupportTicketsList
      listFilter={listFilter}
      onListFilterChange={onListFilterChange}
    />
  );
}
