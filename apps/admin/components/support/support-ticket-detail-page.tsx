'use client';

import { Button, Card, DataTableBadge } from '@africatourismgate/ui';
import type {
  AdminSupportTicketDetail,
  SupportTicketPriority,
  SupportTicketStatus,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getSupportTicketsErrorMessage } from '../../lib/support-tickets-errors';

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

const nextStatus: Partial<Record<SupportTicketStatus, SupportTicketStatus>> = {
  open: 'pending',
  pending: 'resolved',
  resolved: 'closed',
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

type SupportTicketDetailPageProps = {
  ticketId: string;
};

export function SupportTicketDetailPage({ ticketId }: SupportTicketDetailPageProps) {
  const statusSelectId = useId();
  const prioritySelectId = useId();

  const [canWrite, setCanWrite] = useState(false);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; ticket: AdminSupportTicketDetail }
  >({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const ticket = await getApiClient().getSupportTicket(ticketId);
      setState({ status: 'ready', ticket });
    } catch (error) {
      setState({ status: 'error', message: getSupportTicketsErrorMessage(error) });
    }
  }, [ticketId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setCanWrite(
            me.isSuperAdmin || me.permissions.includes('support_tickets.write'),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setCanWrite(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateTicket = useCallback(
    async (patch: { status?: SupportTicketStatus; priority?: SupportTicketPriority }) => {
      setActionError(null);
      setActing(true);
      try {
        await getApiClient().updateSupportTicket(ticketId, patch);
        await load();
      } catch (error) {
        setActionError(getSupportTicketsErrorMessage(error));
      } finally {
        setActing(false);
      }
    },
    [load, ticketId],
  );

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
        <Button href="/contenu/tickets" variant="ghost" size="sm">
          Retour à la liste
        </Button>
      </div>
    );
  }

  const { ticket } = state;
  const forwardStatus = nextStatus[ticket.status];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/contenu/tickets"
            className="text-sm text-atg-muted hover:text-atg-fg"
          >
            ← Tickets support
          </Link>
          <h2 className="mt-2 text-xl font-bold text-atg-fg">{ticket.subject}</h2>
          <p className="mt-1 text-sm text-atg-muted">
            Ouvert le {formatDateTime(ticket.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DataTableBadge variant={statusVariants[ticket.status]}>
            {statusLabels[ticket.status]}
          </DataTableBadge>
          <DataTableBadge variant="default">{priorityLabels[ticket.priority]}</DataTableBadge>
        </div>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-semibold text-atg-fg">Client</h3>
        <p className="mt-2 text-sm text-atg-fg">
          {ticket.customerFirstName?.trim() || '—'}
        </p>
        {ticket.customerEmail ? (
          <p className="text-sm text-atg-muted">{ticket.customerEmail}</p>
        ) : null}
      </Card>

      {canWrite ? (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-atg-fg">Traitement</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={statusSelectId}
                className="mb-1 block text-xs font-medium text-atg-muted"
              >
                Statut
              </label>
              <select
                id={statusSelectId}
                value={ticket.status}
                disabled={acting}
                onChange={(e) =>
                  void updateTicket({
                    status: e.target.value as SupportTicketStatus,
                  })
                }
                className="w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-fg disabled:opacity-60"
              >
                {(Object.keys(statusLabels) as SupportTicketStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor={prioritySelectId}
                className="mb-1 block text-xs font-medium text-atg-muted"
              >
                Priorité
              </label>
              <select
                id={prioritySelectId}
                value={ticket.priority}
                disabled={acting}
                onChange={(e) =>
                  void updateTicket({
                    priority: e.target.value as SupportTicketPriority,
                  })
                }
                className="w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-fg disabled:opacity-60"
              >
                {(Object.keys(priorityLabels) as SupportTicketPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {priorityLabels[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {forwardStatus && ticket.status !== 'closed' ? (
            <div className="mt-4">
              <Button
                type="button"
                disabled={acting}
                loading={acting}
                loadingText="…"
                onClick={() => void updateTicket({ status: forwardStatus })}
              >
                Passer à « {statusLabels[forwardStatus]} »
              </Button>
            </div>
          ) : null}
          {actionError ? (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {actionError}
            </p>
          ) : null}
        </Card>
      ) : null}

      <Card className="p-4">
        <h3 className="text-sm font-semibold text-atg-fg">Messages</h3>
        {ticket.messages.length === 0 ? (
          <p className="mt-3 text-sm text-atg-muted">Aucun message.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {ticket.messages.map((message) => (
              <li
                key={message.id}
                className={`rounded-lg border p-4 ${
                  message.isStaff
                    ? 'border-primary/30 bg-primary/5 dark:border-primary/40 dark:bg-primary/10'
                    : 'border-atg-border bg-atg-surface'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                    {message.isStaff ? 'Agent' : 'Client'}
                  </span>
                  <time className="text-xs text-atg-muted">
                    {formatDateTime(message.createdAt)}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-atg-fg">{message.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
