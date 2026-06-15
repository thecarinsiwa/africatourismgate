import type {
  SupportTicketPriority,
  SupportTicketStatus,
} from '@africatourismgate/types';

export const supportTicketStatusLabels: Record<SupportTicketStatus, string> = {
  open: 'Ouvert',
  pending: 'En cours',
  resolved: 'Résolu',
  closed: 'Fermé',
};

export const supportTicketStatusVariants: Record<
  SupportTicketStatus,
  'success' | 'warning' | 'muted' | 'default'
> = {
  open: 'default',
  pending: 'warning',
  resolved: 'success',
  closed: 'muted',
};

export const supportTicketPriorityLabels: Record<SupportTicketPriority, string> = {
  low: 'Basse',
  normal: 'Normale',
  high: 'Haute',
  urgent: 'Urgente',
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

export const UNASSIGNED_TICKET_LABEL = 'Non assigné';

export function formatSupportTicketDateTime(
  iso: string,
  style: 'short' | 'long' = 'short',
): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: style === 'long' ? 'long' : 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function formatSupportTicketAssignee(
  assigneeName?: string | null,
): string {
  const trimmed = assigneeName?.trim();
  return trimmed || UNASSIGNED_TICKET_LABEL;
}
