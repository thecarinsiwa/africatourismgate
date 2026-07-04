'use client';

import type { BookingMessage } from '@africatourismgate/types';
import { ConversationChat, useToast } from '@africatourismgate/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import { formatBookingDateTime } from '../../lib/bookings/display';
import { useTranslations } from '../../lib/i18n/locale-provider';

const POLL_INTERVAL_MS = 20_000;

type BookingMessagesSectionProps = {
  bookingId: string;
  localeTag: string;
  chatToken?: string | null;
  canReply?: boolean;
};

export function BookingMessagesSection({
  bookingId,
  localeTag,
  chatToken,
  canReply = true,
}: BookingMessagesSectionProps) {
  const t = useTranslations();
  const m = t.account.reservations.detail.messages;
  const { toast } = useToast();

  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const knownMessageIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const client = await getAccountApiClient();
        const result = await client.listBookingMessages(
          bookingId,
          chatToken ? { chatToken } : undefined,
        );
        const nextMessages = result.messages;

        if (initialLoadDoneRef.current) {
          const known = knownMessageIdsRef.current;
          const newStaffMessages = nextMessages.filter(
            (message) => !known.has(message.id) && message.isStaff,
          );
          if (newStaffMessages.length > 0) {
            toast({
              variant: 'info',
              message: m.newStaffMessageToast,
            });
          }
        }

        knownMessageIdsRef.current = new Set(nextMessages.map((message) => message.id));
        initialLoadDoneRef.current = true;
        setMessages(nextMessages);
      } catch {
        if (!options?.silent) {
          setError(m.loadError);
          setMessages([]);
        }
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [bookingId, chatToken, m.loadError, m.newStaffMessageToast, toast],
  );

  useEffect(() => {
    initialLoadDoneRef.current = false;
    knownMessageIdsRef.current = new Set();
    void load();
  }, [load]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void load({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [load]);

  useEffect(() => {
    if (!canReply || chatToken) {
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
  }, [bookingId, canReply, chatToken]);

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
      await load({ silent: true });
    } catch {
      setReplyError(m.sendError);
    } finally {
      setSending(false);
    }
  }, [bookingId, chatToken, load, m.sendError, replyBody]);

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
    <section id="conversation" className="space-y-3 scroll-mt-6">
      <h3 className="text-base font-semibold text-atg-fg">{m.title}</h3>
      <p className="text-sm text-atg-muted">{m.subtitle}</p>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
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
      />
    </section>
  );
}
