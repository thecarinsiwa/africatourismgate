'use client';

import type {
  CustomerSupportTicketDetail,
  SupportTicketMessage,
  SupportTicketStatus,
} from '@africatourismgate/types';
import {
  ConversationChat,
  DataTableBadge,
  Skeleton,
} from '@africatourismgate/ui';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import { AUTH_CHANGED_EVENT, getWebSession } from '../../lib/auth/client-session';
import { formatBookingDateTime } from '../../lib/bookings/display';
import { useResolvedPublicBranding } from '../../lib/branding/use-resolved-public-branding';
import { localeToBcp47 } from '../../lib/i18n/locale-tag';
import type { Locale } from '../../lib/i18n/types';

const POLL_INTERVAL_MS = 20_000;

const STATUS_VARIANT: Record<
  SupportTicketStatus,
  'success' | 'warning' | 'muted' | 'danger'
> = {
  open: 'warning',
  pending: 'muted',
  resolved: 'success',
  closed: 'muted',
};

type Props = {
  ticketId: string;
};

export function AccountSupportTicketDetail({ ticketId }: Props) {
  const t = useTranslations('account.support');
  const locale = useLocale();
  const localeTag = localeToBcp47(locale as Locale);
  const { branding } = useResolvedPublicBranding();

  const [ticket, setTicket] = useState<CustomerSupportTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [customerAvatarUrl, setCustomerAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const syncAvatar = () => {
      const raw = getWebSession()?.user?.avatarUrl ?? null;
      setCustomerAvatarUrl(normalizeBrandingAssetUrl(raw));
    };
    syncAvatar();
    window.addEventListener(AUTH_CHANGED_EVENT, syncAvatar);
    window.addEventListener('storage', syncAvatar);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAvatar);
      window.removeEventListener('storage', syncAvatar);
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = await getAccountApiClient();
      const result = await client.getSupportTicket(ticketId);
      if (!('messages' in result)) {
        setError(t('loadError'));
        setTicket(null);
        return;
      }
      setTicket(result as CustomerSupportTicketDetail);
    } catch {
      setError(t('loadError'));
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [t, ticketId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void (async () => {
        try {
          const client = await getAccountApiClient();
          const result = await client.getSupportTicket(ticketId);
          if ('messages' in result) {
            setTicket(result as CustomerSupportTicketDetail);
          }
        } catch {
          // ignore polling errors
        }
      })();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [ticketId]);

  const canReply = ticket != null && ticket.status !== 'closed';

  const handleSend = useCallback(async () => {
    const body = replyBody.trim();
    if (body.length < 10) {
      setReplyError(t('replyMinLength'));
      return;
    }
    setReplyError(null);
    setSending(true);
    try {
      const client = await getAccountApiClient();
      await client.createCustomerSupportMessage(ticketId, { body });
      setReplyBody('');
      await load();
    } catch {
      setReplyError(t('sendError'));
    } finally {
      setSending(false);
    }
  }, [load, replyBody, t, ticketId]);

  const formatDateSeparator = useCallback(
    (iso: string) => {
      try {
        return new Date(iso).toLocaleDateString(localeTag, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      } catch {
        return iso;
      }
    },
    [localeTag],
  );

  if (loading && !ticket) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-3">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error ?? t('notFound')}
        </p>
        <Link
          href="/account/support"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← {t('backToList')}
        </Link>
      </div>
    );
  }

  const messages: SupportTicketMessage[] = ticket.messages;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href="/account/support"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← {t('backToList')}
          </Link>
          <h3 className="mt-2 text-base font-semibold text-atg-fg dark:text-white">
            {ticket.subject}
          </h3>
          <p className="mt-1 text-xs text-atg-muted">
            {formatBookingDateTime(ticket.createdAt, localeTag)}
          </p>
        </div>
        <DataTableBadge variant={STATUS_VARIANT[ticket.status]}>
          {t(`status.${ticket.status}`)}
        </DataTableBadge>
      </div>

      {!canReply ? (
        <p className="text-sm text-atg-muted">{t('closedHint')}</p>
      ) : null}

      <ConversationChat
        messages={messages.map((message) => ({
          id: message.id,
          body: message.body,
          isStaff: message.isStaff,
          createdAt: message.createdAt,
          authorName: message.isStaff ? branding.displayName : undefined,
          avatarUrl: message.isStaff
            ? branding.logoUrl
            : customerAvatarUrl,
        }))}
        loading={loading}
        labels={{
          threadAria: t('threadAria'),
          loading: t('loading'),
          empty: t('emptyThread'),
          authorStaff: t('authorStaff'),
          authorCustomer: t('authorCustomer'),
          replyTitle: canReply ? t('replyTitle') : undefined,
          replyLabel: t('replyLabel'),
          replyPlaceholder: t('replyPlaceholder'),
          sendReply: t('sendReply'),
        }}
        formatDateTime={(iso) => formatBookingDateTime(iso, localeTag)}
        formatDateSeparator={formatDateSeparator}
        customerAvatarUrl={customerAvatarUrl}
        staffAvatarUrl={branding.logoUrl}
        canReply={canReply}
        replyBody={replyBody}
        onReplyBodyChange={setReplyBody}
        onSend={() => void handleSend()}
        sending={sending}
        replyError={replyError}
        className="min-h-[20rem]"
      />
    </div>
  );
}
