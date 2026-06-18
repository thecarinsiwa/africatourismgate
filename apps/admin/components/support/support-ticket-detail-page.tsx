'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, DataTableBadge } from '@africatourismgate/ui';
import type {
  AdminSupportTicketDetail,
  SupportTicketPriority,
  SupportTicketStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import {
  useFormatDateTime,
  useSupportTicketPriorityLabels,
  useSupportTicketStatusLabels,
} from '../../lib/i18n/use-module-labels';
import {
  SUPPORT_TICKET_PRIORITIES,
  SUPPORT_TICKET_STATUSES,
  supportTicketPriorityVariants,
  supportTicketStatusVariants,
} from '../../lib/support-ticket-display';

const nextStatus: Partial<Record<SupportTicketStatus, SupportTicketStatus>> = {
  open: 'pending',
  pending: 'resolved',
  resolved: 'closed',
};

type SupportTicketDetailPageProps = {
  ticketId: string;
};

export function SupportTicketDetailPage({ ticketId }: SupportTicketDetailPageProps) {
  const { supportTickets: getSupportTicketsErrorMessage } = useAdminErrorMessages();
  const tDetail = useTranslations('modules.support.detail');
  const tColumns = useTranslations('modules.common.columns');
  const tCommon = useTranslations('modules.common');
  const tLoading = useTranslations('common.loading');
  const formatDateTime = useFormatDateTime('long');
  const statusLabels = useSupportTicketStatusLabels();
  const priorityLabels = useSupportTicketPriorityLabels();
  const statusSelectId = useId();
  const prioritySelectId = useId();
  const replyBodyId = useId();

  const [canWrite, setCanWrite] = useState(false);
  const [acting, setActing] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replyValidationError, setReplyValidationError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; ticket: AdminSupportTicketDetail }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: tDetail('title'),
    entityLabel: state.status === 'ready' ? state.ticket.subject : undefined,
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const ticket = await getApiClient().getSupportTicket(ticketId);
      setState({ status: 'ready', ticket });
    } catch (error) {
      setState({ status: 'error', message: getSupportTicketsErrorMessage(error) });
    }
  }, [ticketId, getSupportTicketsErrorMessage]);

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
    [load, ticketId, getSupportTicketsErrorMessage],
  );

  const submitReply = useCallback(async () => {
    setReplyValidationError(null);
    setReplyError(null);

    const trimmed = replyBody.trim();
    if (trimmed.length < 10) {
      setReplyValidationError(tDetail('replyMinLength'));
      return;
    }

    setActing(true);
    try {
      await getApiClient().createSupportMessage({
        ticketId,
        body: trimmed,
      });
      setReplyBody('');
      await load();
    } catch (error) {
      setReplyError(getSupportTicketsErrorMessage(error));
    } finally {
      setActing(false);
    }
  }, [load, replyBody, ticketId, tDetail, getSupportTicketsErrorMessage]);

  const emptyDash = tCommon('empty.dash');

  const openedOnLabel = useMemo(() => {
    if (state.status !== 'ready') return '';
    return tDetail('openedOn', {
      date: formatDateTime(state.ticket.createdAt),
    });
  }, [formatDateTime, state, tDetail]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tLoading('page')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
        <Button href="/contenu/tickets" variant="ghost" size="sm">
          {tDetail('backToList')}
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
          <p className="text-sm text-atg-muted">{openedOnLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DataTableBadge variant={supportTicketStatusVariants[ticket.status]}>
            {statusLabels[ticket.status]}
          </DataTableBadge>
          <DataTableBadge variant={supportTicketPriorityVariants[ticket.priority]}>
            {priorityLabels[ticket.priority]}
          </DataTableBadge>
        </div>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-semibold text-atg-fg">{tDetail('sections.client')}</h3>
        <p className="mt-2 text-sm text-atg-fg">
          {ticket.customerFirstName?.trim() || emptyDash}
        </p>
        {ticket.customerEmail ? (
          <p className="text-sm text-atg-muted">{ticket.customerEmail}</p>
        ) : null}
      </Card>

      {canWrite ? (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-atg-fg">{tDetail('sections.handling')}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={statusSelectId}
                className="mb-1 block text-xs font-medium text-atg-muted"
              >
                {tColumns('status')}
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
                {SUPPORT_TICKET_STATUSES.map((s) => (
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
                {tDetail('fields.priority')}
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
                {SUPPORT_TICKET_PRIORITIES.map((p) => (
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
                {tDetail('advanceStatus', { status: statusLabels[forwardStatus] })}
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
        <h3 className="text-sm font-semibold text-atg-fg">{tDetail('sections.messages')}</h3>
        {ticket.messages.length === 0 ? (
          <p className="mt-3 text-sm text-atg-muted">{tDetail('noMessages')}</p>
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
                    {message.isStaff
                      ? tDetail('messageAuthor.staff')
                      : tDetail('messageAuthor.customer')}
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

      {canWrite && ticket.status !== 'closed' ? (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-atg-fg">{tDetail('sections.reply')}</h3>
          <div className="mt-4">
            <label
              htmlFor={replyBodyId}
              className="mb-1 block text-xs font-medium text-atg-muted"
            >
              {tDetail('fields.agentMessage')}
            </label>
            <textarea
              id={replyBodyId}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              rows={4}
              disabled={acting}
              minLength={10}
              placeholder={tDetail('replyPlaceholder')}
              className="w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-fg placeholder:text-atg-muted disabled:opacity-60"
            />
          </div>
          {replyValidationError ? (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {replyValidationError}
            </p>
          ) : null}
          {replyError ? (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {replyError}
            </p>
          ) : null}
          <div className="mt-4">
            <Button
              type="button"
              disabled={acting || replyBody.trim().length < 10}
              loading={acting}
              loadingText={tDetail('sending')}
              onClick={() => void submitReply()}
            >
              {tDetail('sendReply')}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
