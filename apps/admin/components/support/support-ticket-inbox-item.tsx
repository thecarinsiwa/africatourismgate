'use client';

import { DataTableBadge, Skeleton } from '@africatourismgate/ui';
import type { AdminSupportTicketListItem } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  useFormatDateTime,
  useSupportTicketPriorityLabels,
  useSupportTicketStatusLabels,
} from '../../lib/i18n/use-module-labels';
import {
  supportTicketPriorityVariants,
  supportTicketStatusVariants,
} from '../../lib/support-ticket-display';

type SupportTicketInboxItemProps = {
  ticket: AdminSupportTicketListItem;
  /** When true, emphasize last-message author (messages inbox). */
  showMessageAuthor?: boolean;
};

function customerInitial(ticket: AdminSupportTicketListItem): string {
  const name = ticket.customerFirstName?.trim();
  if (name) return name.charAt(0).toUpperCase();
  const email = ticket.customerEmail?.trim();
  if (email) return email.charAt(0).toUpperCase();
  return '?';
}

export function SupportTicketInboxItem({
  ticket,
  showMessageAuthor = false,
}: SupportTicketInboxItemProps) {
  const tCommon = useTranslations('modules.common');
  const tList = useTranslations('modules.support.list');
  const tInbox = useTranslations('modules.support.messagesInbox');
  const formatDateTime = useFormatDateTime();
  const statusLabels = useSupportTicketStatusLabels();
  const priorityLabels = useSupportTicketPriorityLabels();
  const emptyDash = tCommon('empty.dash');
  const when = ticket.lastMessageAt || ticket.createdAt;
  const customerName = ticket.customerFirstName?.trim() || emptyDash;
  const awaitingAgent = ticket.lastMessageIsStaff === false;
  const awaitingCustomer = ticket.lastMessageIsStaff === true;

  const authorLabel =
    ticket.lastMessageIsStaff === true
      ? tInbox('fromStaff')
      : ticket.lastMessageIsStaff === false
        ? tInbox('fromCustomer')
        : null;

  return (
    <Link
      href={`/contenu/tickets/${ticket.id}`}
      className="group flex gap-3 border-b border-atg-border px-4 py-4 transition-colors last:border-b-0 hover:bg-atg-elevated/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:gap-4 sm:px-5"
    >
      <span
        className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-atg-border bg-atg-surface text-sm font-semibold text-atg-muted dark:bg-white/5"
        aria-hidden
      >
        {customerInitial(ticket)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <p className="min-w-0 flex-1 text-sm font-semibold text-atg-fg group-hover:text-primary sm:text-base">
            {ticket.subject}
          </p>
          <time
            className="shrink-0 text-xs tabular-nums text-atg-muted"
            dateTime={when}
          >
            {formatDateTime(when)}
          </time>
        </div>

        <p className="mt-1 truncate text-sm text-atg-muted">
          <span className="font-medium text-atg-fg/80">{customerName}</span>
          {ticket.customerEmail ? (
            <span> · {ticket.customerEmail}</span>
          ) : null}
          {showMessageAuthor && authorLabel ? (
            <span> · {authorLabel}</span>
          ) : null}
        </p>

        {ticket.lastMessagePreview ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-atg-fg/85">
            {ticket.lastMessagePreview}
          </p>
        ) : (
          <p className="mt-1.5 text-sm text-atg-muted">{tInbox('noPreview')}</p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <DataTableBadge variant={supportTicketStatusVariants[ticket.status]}>
            {statusLabels[ticket.status]}
          </DataTableBadge>
          <DataTableBadge variant={supportTicketPriorityVariants[ticket.priority]}>
            {priorityLabels[ticket.priority]}
          </DataTableBadge>
          {awaitingAgent ? (
            <DataTableBadge variant="warning">{tList('awaitingAgent')}</DataTableBadge>
          ) : null}
          {awaitingCustomer ? (
            <DataTableBadge variant="muted">{tList('awaitingCustomer')}</DataTableBadge>
          ) : null}
        </div>
      </div>

      <span
        className="mt-1 hidden shrink-0 text-atg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:inline"
        aria-hidden
      >
        →
      </span>
    </Link>
  );
}

export function SupportTicketInboxSkeleton() {
  return (
    <div className="divide-y divide-atg-border">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex justify-between gap-4">
              <Skeleton className="h-5 w-2/3 max-w-sm" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
