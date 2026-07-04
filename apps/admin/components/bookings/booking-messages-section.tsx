'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { ConversationChat, Modal, useToast } from '@africatourismgate/ui';
import type { BookingMessage } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DraggableFab } from '../draggable-fab';
import { getApiClient } from '../../lib/auth/api';
import { BookingChatFabIcon } from './booking-chat-fab-icon';

const POLL_INTERVAL_MS = 20_000;
const FAB_STORAGE_KEY = 'atg-admin-booking-chat-fab-position';

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

function formatDateSeparator(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function BookingMessagesSection({ bookingId, canWrite }: BookingMessagesSectionProps) {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.messages');
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const knownMessageIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const result = await getApiClient().listBookingMessages(bookingId);
        const nextMessages = result.messages;

        if (initialLoadDoneRef.current) {
          const known = knownMessageIdsRef.current;
          const newCustomerMessages = nextMessages.filter(
            (message) => !known.has(message.id) && !message.isStaff,
          );
          if (newCustomerMessages.length > 0) {
            if (open) {
              toast({
                variant: 'info',
                message: t('toast.newCustomerMessage'),
              });
            } else {
              setHasUnread(true);
            }
          }
        }

        knownMessageIdsRef.current = new Set(nextMessages.map((message) => message.id));
        initialLoadDoneRef.current = true;
        setMessages(nextMessages);
      } catch (err) {
        if (!options?.silent) {
          setError(getBookingsErrorMessage(err));
          setMessages([]);
        }
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [bookingId, getBookingsErrorMessage, open, t, toast],
  );

  useEffect(() => {
    initialLoadDoneRef.current = false;
    knownMessageIdsRef.current = new Set();
    setHasUnread(false);
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
    if (open) {
      setHasUnread(false);
    }
  }, [open]);

  const handleSend = useCallback(async () => {
    const body = replyBody.trim();
    if (!body) {
      return;
    }
    setReplyError(null);
    setSending(true);
    try {
      const created = await getApiClient().createBookingMessage(bookingId, { body });
      setReplyBody('');
      await load({ silent: true });
      toast({
        variant: 'success',
        message: created.customerNotifiedByEmail
          ? t('toast.sentWithEmail')
          : t('toast.sent'),
      });
    } catch (err) {
      setReplyError(getBookingsErrorMessage(err));
    } finally {
      setSending(false);
    }
  }, [bookingId, getBookingsErrorMessage, load, replyBody, t, toast]);

  return (
    <>
      {!open ? (
        <DraggableFab
          onClick={() => setOpen(true)}
          ariaLabel={t('fabAriaLabel')}
          storageKey={FAB_STORAGE_KEY}
          badge={hasUnread ? <span aria-hidden /> : undefined}
        >
          <BookingChatFabIcon className="size-full" />
        </DraggableFab>
      ) : null}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={t('title')}
        showClose
        className="flex max-h-[min(720px,90vh)] w-full max-w-2xl flex-col"
      >
        {error ? (
          <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <ConversationChat
          messages={messages}
          loading={loading}
          labels={{
            threadAria: t('threadAria'),
            loading: t('loading'),
            empty: t('empty'),
            authorStaff: t('author.staff'),
            authorCustomer: t('author.customer'),
            replyTitle: canWrite ? t('replyTitle') : undefined,
            replyLabel: t('replyLabel'),
            replyPlaceholder: t('replyPlaceholder'),
            sendReply: t('sendReply'),
          }}
          formatDateTime={formatDateTime}
          formatDateSeparator={formatDateSeparator}
          canReply={canWrite}
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
