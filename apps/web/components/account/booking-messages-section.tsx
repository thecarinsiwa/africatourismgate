'use client';

import type { BookingMessage } from '@africatourismgate/types';
import {
  BookingChatFabIcon,
  ConversationChat,
  DraggableFab,
  Modal,
  useToast,
} from '@africatourismgate/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import { formatBookingDateTime } from '../../lib/bookings/display';
import { useTranslations } from '../../lib/i18n/locale-provider';

const POLL_INTERVAL_MS = 20_000;
const FAB_STORAGE_KEY = 'atg-web-booking-chat-fab-position';

type BookingMessagesSectionProps = {
  bookingId: string;
  localeTag: string;
  chatToken?: string | null;
  canReply?: boolean;
  initialUnreadCount?: number;
  autoOpen?: boolean;
};

export function BookingMessagesSection({
  bookingId,
  localeTag,
  chatToken,
  canReply = true,
  initialUnreadCount = 0,
  autoOpen = false,
}: BookingMessagesSectionProps) {
  const t = useTranslations();
  const m = t.account.reservations.detail.messages;
  const { toast } = useToast();

  const [open, setOpen] = useState(autoOpen);
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const previousUnreadCountRef = useRef(initialUnreadCount);

  const refreshUnreadCount = useCallback(async () => {
    if (chatToken) {
      return;
    }
    try {
      const client = await getAccountApiClient();
      const result = await client.getBookingUnreadMessageCount(bookingId);
      const nextCount = result.count;
      if (nextCount > previousUnreadCountRef.current && !open) {
        toast({
          variant: 'info',
          message: m.newStaffMessageToast,
        });
      }
      previousUnreadCountRef.current = nextCount;
      setUnreadCount(nextCount);
    } catch {
      // ignore polling errors
    }
  }, [bookingId, chatToken, m.newStaffMessageToast, open, toast]);

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
    } catch {
      setError(m.loadError);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [bookingId, chatToken, m.loadError]);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
    previousUnreadCountRef.current = initialUnreadCount;
  }, [bookingId, initialUnreadCount]);

  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
    }
  }, [autoOpen, bookingId]);

  useEffect(() => {
    if (!open) {
      void refreshUnreadCount();
      const intervalId = window.setInterval(() => {
        void refreshUnreadCount();
      }, POLL_INTERVAL_MS);
      return () => window.clearInterval(intervalId);
    }
    return undefined;
  }, [open, refreshUnreadCount]);

  useEffect(() => {
    if (open) {
      void loadMessages();
    }
  }, [open, loadMessages]);

  useEffect(() => {
    if (!open || !canReply || chatToken) {
      return;
    }

    let cancelled = false;

    const ping = async () => {
      try {
        const client = await getAccountApiClient();
        await client.touchBookingThreadPresence(bookingId);
      } catch {
        // Presence is best-effort; thread still works without it.
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
  }, [bookingId, canReply, chatToken, open]);

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

  const fabAriaLabel =
    unreadCount > 0
      ? m.fabAriaLabelWithUnread.replace('{count}', String(unreadCount))
      : m.fabAriaLabel;

  return (
    <>
      {!open ? (
        <DraggableFab
          onClick={() => setOpen(true)}
          ariaLabel={fabAriaLabel}
          storageKey={FAB_STORAGE_KEY}
          badgeCount={unreadCount}
        >
          <BookingChatFabIcon className="size-11" />
        </DraggableFab>
      ) : null}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={m.title}
        showClose
        className="flex max-h-[min(720px,90vh)] w-full max-w-2xl flex-col"
      >
        <p className="mb-3 text-sm text-atg-muted">{m.subtitle}</p>

        {error ? (
          <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <ConversationChat
          messages={messages}
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
      </Modal>
    </>
  );
}
