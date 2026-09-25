'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  ConversationChat,
  DataTableBadge,
  Select,
  Skeleton,
} from '@africatourismgate/ui';
import type {
  AdminSupportTicketDetail,
  SupportTicketPriority,
  SupportTicketStatus,
} from '@africatourismgate/types';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import { useFormatter, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { getApiClient } from '../../lib/auth/api';
import { AUTH_CHANGED_EVENT, getSession } from '../../lib/auth/session';
import { usePermissions } from '../../lib/auth/use-permissions';
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
import { useOrganizationThemeOptional } from '../organization-theme-provider';

export const SUPPORT_TICKETS_HUB_HREF = '/contenu/support?tab=tickets';

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
  const format = useFormatter();
  const formatDateTime = useFormatDateTime('long');
  const statusLabels = useSupportTicketStatusLabels();
  const priorityLabels = useSupportTicketPriorityLabels();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canWrite = isSuperAdmin || hasPermission('support_tickets.write');
  const orgTheme = useOrganizationThemeOptional();

  const [acting, setActing] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [staffAvatarUrl, setStaffAvatarUrl] = useState<string | null>(null);
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

  const formatDateSeparator = useCallback(
    (iso: string) => {
      try {
        return format.dateTime(new Date(iso), {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      } catch {
        return iso;
      }
    },
    [format],
  );

  useEffect(() => {
    const syncStaffAvatar = () => {
      const sessionAvatar = normalizeBrandingAssetUrl(
        getSession()?.user?.avatarUrl ?? null,
      );
      const logoAvatar = normalizeBrandingAssetUrl(
        orgTheme?.branding?.logoUrl ?? null,
      );
      setStaffAvatarUrl(sessionAvatar ?? logoAvatar);
    };
    syncStaffAvatar();
    window.addEventListener(AUTH_CHANGED_EVENT, syncStaffAvatar);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, syncStaffAvatar);
  }, [orgTheme?.branding?.logoUrl]);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const ticket = (await getApiClient().getSupportTicket(
        ticketId,
      )) as AdminSupportTicketDetail;
      setState({ status: 'ready', ticket });
    } catch (error) {
      setState({ status: 'error', message: getSupportTicketsErrorMessage(error) });
    }
  }, [ticketId, getSupportTicketsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

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
    setReplyError(null);

    const trimmed = replyBody.trim();
    if (trimmed.length < 10) {
      setReplyError(tDetail('replyMinLength'));
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

  const statusOptions = useMemo(
    () =>
      SUPPORT_TICKET_STATUSES.map((status) => ({
        value: status,
        label: statusLabels[status],
      })),
    [statusLabels],
  );

  const priorityOptions = useMemo(
    () =>
      SUPPORT_TICKET_PRIORITIES.map((priority) => ({
        value: priority,
        label: priorityLabels[priority],
      })),
    [priorityLabels],
  );

  const openedOnLabel = useMemo(() => {
    if (state.status !== 'ready') return '';
    return tDetail('openedOn', {
      date: formatDateTime(state.ticket.createdAt),
    });
  }, [formatDateTime, state, tDetail]);

  const chatMessages = useMemo(() => {
    if (state.status !== 'ready') return [];
    const customerName = state.ticket.customerFirstName?.trim() || null;
    return state.ticket.messages.map((message) => ({
      id: message.id,
      body: message.body,
      isStaff: message.isStaff,
      createdAt: message.createdAt,
      authorName: message.isStaff
        ? tDetail('messageAuthor.staff')
        : customerName || tDetail('messageAuthor.customer'),
    }));
  }, [state, tDetail]);

  if (state.status === 'loading') {
    return (
      <AdminIntroPage
        routePath="contenu/tickets/id"
        backHref={SUPPORT_TICKETS_HUB_HREF}
        backLabelKey="backLabel"
      >
        <Skeleton className="h-96 w-full max-w-3xl" />
        <p className="sr-only">{tCommon('loading')}</p>
      </AdminIntroPage>
    );
  }

  if (state.status === 'error') {
    return (
      <AdminIntroPage
        routePath="contenu/tickets/id"
        backHref={SUPPORT_TICKETS_HUB_HREF}
        backLabelKey="backLabel"
      >
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      </AdminIntroPage>
    );
  }

  const { ticket } = state;
  const forwardStatus = nextStatus[ticket.status];
  const canReply = canWrite && ticket.status !== 'closed';

  return (
    <AdminIntroPage
      routePath="contenu/tickets/id"
      backHref={SUPPORT_TICKETS_HUB_HREF}
      backLabelKey="backLabel"
    >
      <div className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-sm text-atg-muted">{openedOnLabel}</p>
          <div className="flex flex-wrap gap-2">
            <DataTableBadge variant={supportTicketStatusVariants[ticket.status]}>
              {statusLabels[ticket.status]}
            </DataTableBadge>
            <DataTableBadge variant={supportTicketPriorityVariants[ticket.priority]}>
              {priorityLabels[ticket.priority]}
            </DataTableBadge>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
          <section className="min-w-0 space-y-3" aria-labelledby="ticket-messages-heading">
            <h3
              id="ticket-messages-heading"
              className="text-sm font-semibold text-atg-fg"
            >
              {tDetail('sections.messages')}
            </h3>

            {!canReply && ticket.status === 'closed' ? (
              <p className="text-sm text-atg-muted">{tDetail('closedHint')}</p>
            ) : null}

            <ConversationChat
              messages={chatMessages}
              labels={{
                threadAria: tDetail('threadAria'),
                loading: tDetail('loading'),
                empty: tDetail('noMessages'),
                authorStaff: tDetail('messageAuthor.staff'),
                authorCustomer: tDetail('messageAuthor.customer'),
                replyTitle: canReply ? tDetail('sections.reply') : undefined,
                replyLabel: tDetail('fields.agentMessage'),
                replyPlaceholder: tDetail('replyPlaceholder'),
                sendReply: tDetail('sendReply'),
              }}
              formatDateTime={formatDateTime}
              formatDateSeparator={formatDateSeparator}
              staffAvatarUrl={staffAvatarUrl}
              canReply={canReply}
              replyBody={replyBody}
              onReplyBodyChange={setReplyBody}
              onSend={() => void submitReply()}
              sending={acting}
              replyError={replyError}
              className="min-h-[22rem]"
            />
          </section>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-atg-fg">
                {tDetail('sections.client')}
              </h3>
              <p className="mt-2 text-sm font-medium text-atg-fg">
                {ticket.customerFirstName?.trim() || emptyDash}
              </p>
              {ticket.customerEmail ? (
                <a
                  href={`mailto:${ticket.customerEmail}`}
                  className="mt-1 block break-all text-sm text-primary hover:underline"
                >
                  {ticket.customerEmail}
                </a>
              ) : null}
            </Card>

            {canWrite ? (
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-atg-fg">
                  {tDetail('sections.handling')}
                </h3>
                <div className="mt-4 grid gap-4">
                  <Select
                    label={tColumns('status')}
                    value={ticket.status}
                    options={statusOptions}
                    disabled={acting}
                    onChange={(e) =>
                      void updateTicket({
                        status: e.target.value as SupportTicketStatus,
                      })
                    }
                  />
                  <Select
                    label={tDetail('fields.priority')}
                    value={ticket.priority}
                    options={priorityOptions}
                    disabled={acting}
                    onChange={(e) =>
                      void updateTicket({
                        priority: e.target.value as SupportTicketPriority,
                      })
                    }
                  />
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
                      {tDetail('advanceStatus', {
                        status: statusLabels[forwardStatus],
                      })}
                    </Button>
                  </div>
                ) : null}
                {actionError ? (
                  <p
                    className="mt-3 text-sm text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {actionError}
                  </p>
                ) : null}
              </Card>
            ) : null}
          </aside>
        </div>
      </div>
    </AdminIntroPage>
  );
}
