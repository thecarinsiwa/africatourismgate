'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card } from '@africatourismgate/ui';
import type { BookingMessage } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

type BookingMessagesSectionProps = {
  bookingId: string;
  canWrite: boolean;
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function BookingMessagesSection({ bookingId, canWrite }: BookingMessagesSectionProps) {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.messages');
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
      const result = await getApiClient().listBookingMessages(bookingId);
      setMessages(result.messages);
    } catch (err) {
      setError(getBookingsErrorMessage(err));
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [bookingId, getBookingsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSend = useCallback(async () => {
    const body = replyBody.trim();
    if (!body) {
      return;
    }
    setReplyError(null);
    setSending(true);
    try {
      await getApiClient().createBookingMessage(bookingId, { body });
      setReplyBody('');
      await load();
    } catch (err) {
      setReplyError(getBookingsErrorMessage(err));
    } finally {
      setSending(false);
    }
  }, [bookingId, getBookingsErrorMessage, load, replyBody]);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <Card variant="dashboard" padding="md">
        {loading ? (
          <p className="text-sm text-atg-muted">{t('loading')}</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-atg-muted">{t('empty')}</p>
        ) : (
          <ul className="space-y-4" aria-label={t('threadAria')}>
            {messages.map((message) => (
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
                    {message.isStaff ? t('author.staff') : t('author.customer')}
                  </span>
                  <time className="text-xs text-atg-muted">{formatDateTime(message.createdAt)}</time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-atg-fg">{message.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {canWrite ? (
        <Card variant="dashboard" padding="md" className="space-y-4">
          <h3 className="text-sm font-semibold text-atg-fg">{t('replyTitle')}</h3>
          <div>
            <label htmlFor={replyBodyId} className="mb-1 block text-xs font-medium text-atg-muted">
              {t('replyLabel')}
            </label>
            <textarea
              id={replyBodyId}
              rows={4}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              disabled={sending}
              placeholder={t('replyPlaceholder')}
              className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted disabled:opacity-60"
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
            {t('sendReply')}
          </Button>
        </Card>
      ) : null}
    </section>
  );
}
