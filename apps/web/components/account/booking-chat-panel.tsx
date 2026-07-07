'use client';

import type { BookingMessage } from '@africatourismgate/types';
import { ConversationChat, useToast } from '@africatourismgate/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import { formatBookingDateTime } from '../../lib/bookings/display';
import { useTranslations } from '../../lib/i18n/locale-provider';

const POLL_INTERVAL_MS = 20_000;

type BookingChatPanelProps = {
  bookingId: string;
  localeTag: string;
  chatToken?: string | null;
  canReply?: boolean;
  initialUnreadCount?: number;
  /** When false, skip unread polling (parent handles aggregate badge). */
  trackUnread?: boolean;
  /** When false, skip loading and unread polling. */
  active?: boolean;
  className?: string;
};

export function BookingChatPanel({
  bookingId,
  localeTag,
  chatToken,
  canReply = true,
  initialUnreadCount = 0,
  trackUnread = true,
  onUnreadChange,
  active = true,
  className,
}: BookingChatPanelProps) {
  const t = useTranslations();
  const m = t.account.reservations.detail.messages;
  const { toast } = useToast();

  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const previousUnreadCountRef = useRef(initialUnreadCount);

  const refreshUnreadCount = useCallback(async () => {
    if (chatToken || !trackUnread) {
      return;
    }
    try {
      const client = await getAccountApiClient();
      const result = await client.getBookingUnreadMessageCount(bookingId);
      const nextCount = result.count;
      if (nextCount > previousUnreadCountRef.current) {
        toast({
          variant: 'info',
          message: m.newStaffMessageToast,
        });
      }
      previousUnreadCountRef.current = nextCount;
      setUnreadCount(nextCount);
      onUnreadChange?.(nextCount);
    } catch {
      // ignore polling errors
    }
  }, [bookingId, chatToken, m.newStaffMessageToast, onUnreadChange, toast, trackUnread]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = await getAccountApiClient();
      const result = await client.listBookingMessages(
        bookingId,
        chatToken ? { chatToken, markRead: true } : { markRead: true },
      );
      setMessages(result.messages);
      setUnreadCount(0);
      previousUnreadCountRef.current = 0;
      onUnreadChange?.(0);
    } catch {
      setError(m.loadError);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [bookingId, chatToken, m.loadError, onUnreadChange]);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
    previousUnreadCountRef.current = initialUnreadCount;
  }, [bookingId, initialUnreadCount]);

  useEffect(() => {
    if (!active) {
      return;
    }
    void loadMessages();
  }, [active, loadMessages]);

  useEffect(() => {
    if (!trackUnread || !active) {
      return undefined;
    }
    void refreshUnreadCount();
    const intervalId = window.setInterval(() => {
      void refreshUnreadCount();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [active, refreshUnreadCount, trackUnread]);

  useEffect(() => {
    if (!canReply || chatToken || !active) {
      return;
    }

    let cancelled = false;

    const ping = async () => {
      try {
        const client = await getAccountApiClient();
        await client.touchBookingThreadPresence(bookingId);
      } catch {
        // Presence is best-effort.
      }
    };

    void ping();
    const intervalId = window.setInterval(() => {
      if (!cancelled) {
        void ping();
      }
    }, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [bookingId, canReply, chatToken, active]);

  const handleSend = useCallback(async () => {
    const body = replyBody.trim();
    if (!body) {
      return;
    }
    setReplyError(null);
    setSending(true);
    try {
      const client = await getAccountApiClient();
      await client.createBookingMessage(
        bookingId,
        { body },
        chatToken ? { chatToken } : undefined,
      );
      setReplyBody('');
      await loadMessages();
    } catch {
      setReplyError(m.sendError);
    } finally {
      setSending(false);
    }
  }, [bookingId, chatToken, loadMessages, m.sendError, replyBody]);

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

  return (
    <div className={className}>
      <p className="mb-3 text-sm text-atg-muted">{m.subtitle}</p>

      {error ? (
        <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <ConversationChat
        messages={messages.map((message) =>
          message.isStaff ? message : { ...message, authorName: undefined },
        )}
        loading={loading}
        labels={{
          threadAria: m.threadAria,
          loading: m.loading,
          empty: m.empty,
          authorStaff: m.authorStaff,
          authorCustomer: m.authorCustomer,
          replyTitle: canReply ? m.replyTitle : undefined,
          replyLabel: m.replyLabel,
          replyPlaceholder: m.replyPlaceholder,
          sendReply: m.sendReply,
        }}
        formatDateTime={(iso) => formatBookingDateTime(iso, localeTag)}
        formatDateSeparator={formatDateSeparator}
        canReply={canReply}
        replyBody={replyBody}
        onReplyBodyChange={setReplyBody}
        onSend={() => void handleSend()}
        sending={sending}
        replyError={replyError}
        className="min-h-0 flex-1"
      />
    </div>
  );
}
