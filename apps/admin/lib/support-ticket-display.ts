import type {
  SupportTicketPriority,
  SupportTicketStatus,
} from '@africatourismgate/types';

export const SUPPORT_TICKET_STATUSES: SupportTicketStatus[] = [
  'open',
  'pending',
  'resolved',
  'closed',
];

export const SUPPORT_TICKET_PRIORITIES: SupportTicketPriority[] = [
  'low',
  'normal',
  'high',
  'urgent',
];

export const supportTicketStatusVariants: Record<
  SupportTicketStatus,
  'success' | 'warning' | 'muted' | 'default'
> = {
  open: 'default',
  pending: 'warning',
  resolved: 'success',
  closed: 'muted',
};

export const supportTicketPriorityVariants: Record<
  SupportTicketPriority,
  'success' | 'warning' | 'muted' | 'default'
> = {
  low: 'muted',
  normal: 'default',
  high: 'warning',
  urgent: 'warning',
};

export function formatSupportTicketDateTime(
  iso: string,
  locale: string,
  style: 'short' | 'long' = 'short',
): string {
  try {
    return new Date(iso).toLocaleString(locale, {
      dateStyle: style === 'long' ? 'long' : 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function formatSupportTicketAssignee(
  assigneeName: string | null | undefined,
  unassignedLabel: string,
): string {
  const trimmed = assigneeName?.trim();
  return trimmed || unassignedLabel;
}
