'use client';

import type { BookingMessage } from '@africatourismgate/types';
import { Button } from '@africatourismgate/ui';
import { useCallback, useEffect, useId, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import { formatBookingDateTime } from '../../lib/bookings/display';
import { useTranslations } from '../../lib/i18n/locale-provider';

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
  const replyBodyId = useId();

  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = await getAccountApiClient();
      const result = await client.listBookingMessages(
        bookingId,
        chatToken ? { chatToken } : undefined,
      );
      setMessages(result.messages);
    } catch {
      setError(m.loadError);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [bookingId, chatToken, m.loadError]);

  useEffect(() => {
    void load();
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
      await load();
    } catch {
      setReplyError(m.sendError);
    } finally {
      setSending(false);
    }
  }, [bookingId, chatToken, load, m.sendError, replyBody]);

  return (
    <section id="conversation" className="space-y-3 scroll-mt-6">
      <h3 className="text-base font-semibold text-atg-fg">{m.title}</h3>
      <p className="text-sm text-atg-muted">{m.subtitle}</p>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <div className="rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
        {loading ? (
          <p className="text-sm text-atg-muted">{m.loading}</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-atg-muted">{m.empty}</p>
        ) : (
          <ul className="space-y-4" aria-label={m.threadAria}>
            {messages.map((message) => (
              <li
                key={message.id}
                className={`rounded-lg border p-4 ${
                  message.isStaff
                    ? 'border-primary/30 bg-primary/5 dark:border-primary/40 dark:bg-primary/10'
                    : 'border-atg-border bg-atg-elevated dark:bg-white/5'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                    {message.isStaff ? m.authorStaff : m.authorCustomer}
                  </span>
                  <time className="text-xs text-atg-muted">
                    {formatBookingDateTime(message.createdAt, localeTag)}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-atg-fg">{message.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {canReply ? (
        <div className="space-y-4 rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
          <h4 className="text-sm font-semibold text-atg-fg">{m.replyTitle}</h4>
          <div>
            <label htmlFor={replyBodyId} className="mb-1 block text-xs font-medium text-atg-muted">
              {m.replyLabel}
            </label>
            <textarea
              id={replyBodyId}
              rows={4}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              disabled={sending}
              placeholder={m.replyPlaceholder}
              className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted disabled:opacity-60 dark:bg-white/5"
            />
          </div>
          {replyError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {replyError}
            </p>
          ) : null}
          <Button
            type="button"
            variant="primary"
            disabled={sending || !replyBody.trim()}
            loading={sending}
            onClick={() => void handleSend()}
          >
            {m.sendReply}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
